import { NextRequest, NextResponse } from 'next/server';
import { bookings } from '@/lib/database-neon';
import { z } from 'zod';

const photoMetadataSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    accuracy: z.number().optional()
  }).optional(),
  type: z.enum(['before', 'after', 'general'])
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const bookingId = parseInt(resolvedParams.id);
    
    if (isNaN(bookingId)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid booking ID'
      }, { status: 400 });
    }

    // Get the booking to verify it exists
    const booking = await bookings.getById(bookingId);
    if (!booking) {
      return NextResponse.json({
        success: false,
        message: 'Booking not found'
      }, { status: 404 });
    }

    const formData = await request.formData();
    const photos = formData.getAll('photos') as File[];
    
    if (photos.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No photos provided'
      }, { status: 400 });
    }

    // Process photos and metadata
    const processedPhotos = [];
    
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      const metadataString = formData.get(`metadata_${i}`) as string;
      
      if (!photo || !metadataString) {
        continue;
      }

      try {
        const metadata = JSON.parse(metadataString);
        const validatedMetadata = photoMetadataSchema.parse(metadata);
        
        // Convert file to base64 for storage (in production, use cloud storage)
        const bytes = await photo.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = buffer.toString('base64');
        const dataUrl = `data:${photo.type};base64,${base64}`;
        
        processedPhotos.push({
          id: validatedMetadata.id,
          filename: photo.name,
          size: photo.size,
          type: photo.type,
          dataUrl: dataUrl,
          metadata: validatedMetadata,
          uploadedAt: new Date().toISOString()
        });
        
      } catch (error) {
        console.error('Error processing photo:', error);
        continue;
      }
    }

    if (processedPhotos.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No valid photos could be processed'
      }, { status: 400 });
    }

    // Store photos in booking (in production, store URLs to cloud storage)
    // For now, we'll store the processed photo data in the booking's photos field
    const currentPhotos = booking.photos || [];
    const updatedPhotos = [...currentPhotos, ...processedPhotos];
    
    // Update booking with photos
    await bookings.updatePhotos(bookingId, updatedPhotos);

    return NextResponse.json({
      success: true,
      message: `Successfully uploaded ${processedPhotos.length} photo(s)`,
      photos: processedPhotos.map(p => ({
        id: p.id,
        filename: p.filename,
        size: p.size,
        type: p.metadata.type,
        timestamp: p.metadata.timestamp,
        location: p.metadata.location
      }))
    });

  } catch (error) {
    console.error('Photo upload error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const bookingId = parseInt(resolvedParams.id);
    
    if (isNaN(bookingId)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid booking ID'
      }, { status: 400 });
    }

    const booking = await bookings.getById(bookingId);
    if (!booking) {
      return NextResponse.json({
        success: false,
        message: 'Booking not found'
      }, { status: 404 });
    }

    const photos = booking.photos || [];
    
    return NextResponse.json({
      success: true,
      photos: photos.map((photo: any) => ({
        id: photo.id,
        filename: photo.filename,
        size: photo.size,
        type: photo.metadata?.type || 'general',
        timestamp: photo.metadata?.timestamp,
        location: photo.metadata?.location,
        dataUrl: photo.dataUrl // In production, return cloud storage URL
      }))
    });

  } catch (error) {
    console.error('Photo retrieval error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
