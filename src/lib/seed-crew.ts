import { crewMembers } from './database-neon';

export async function seedCrewMembers() {
  try {
    console.log('Seeding crew members...');

    const sampleCrewMembers = [
      {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@maidly.ai',
        phone: '+1 (555) 123-4567',
        employee_id: 'EMP001',
        status: 'available' as const,
        hourly_rate_cents: 1850, // $18.50/hour
        hire_date: '2024-01-15',
        certifications: ['Basic Cleaning', 'Eco-Friendly Products', 'Safety Training'],
        emergency_contact: {
          name: 'Mike Johnson',
          phone: '+1 (555) 123-4568',
          relationship: 'Spouse'
        }
      },
      {
        name: 'Mike Chen',
        email: 'mike.chen@maidly.ai',
        phone: '+1 (555) 234-5678',
        employee_id: 'EMP002',
        status: 'available' as const,
        hourly_rate_cents: 2000, // $20.00/hour
        hire_date: '2024-01-10',
        certifications: ['Basic Cleaning', 'Deep Cleaning Specialist', 'Team Lead'],
        emergency_contact: {
          name: 'Lisa Chen',
          phone: '+1 (555) 234-5679',
          relationship: 'Spouse'
        }
      },
      {
        name: 'Lisa Rodriguez',
        email: 'lisa.rodriguez@maidly.ai',
        phone: '+1 (555) 345-6789',
        employee_id: 'EMP003',
        status: 'available' as const,
        hourly_rate_cents: 1925, // $19.25/hour
        hire_date: '2024-02-01',
        certifications: ['Basic Cleaning', 'Window Cleaning', 'Customer Service'],
        emergency_contact: {
          name: 'Carlos Rodriguez',
          phone: '+1 (555) 345-6790',
          relationship: 'Brother'
        }
      },
      {
        name: 'David Kim',
        email: 'david.kim@maidly.ai',
        phone: '+1 (555) 456-7890',
        employee_id: 'EMP004',
        status: 'available' as const,
        hourly_rate_cents: 1750, // $17.50/hour
        hire_date: '2024-02-15',
        certifications: ['Basic Cleaning', 'Move-in/Move-out Specialist'],
        emergency_contact: {
          name: 'Jenny Kim',
          phone: '+1 (555) 456-7891',
          relationship: 'Sister'
        }
      }
    ];

    for (const member of sampleCrewMembers) {
      try {
        const id = await crewMembers.create(member);
        console.log(`Created crew member: ${member.name} (ID: ${id})`);
      } catch (error) {
        console.log(`Crew member ${member.name} may already exist, skipping...`);
      }
    }

    console.log('Crew member seeding completed!');
  } catch (error) {
    console.error('Error seeding crew members:', error);
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedCrewMembers();
}
