const { CoreAPIClient } = require('../../release/index');
require('dotenv').config();

/**
 * Example demonstrating FSM Optimization API usage
 * 
 * This example shows how to:
 * 1. List available optimization plugins (policies)
 * 2. Find best matching technicians for an activity
 * 3. Search for available time slots
 * 4. Execute re-optimization
 * 5. Monitor optimization task status
 */

(async () => {

  // Initialize the client
  const client = new CoreAPIClient({
    debug: false,
    clientIdentifier: process.env.CLIENT_IDENTIFIER,
    clientSecret: process.env.CLIENT_SECRET,
    clientVersion: '1.0.0',
    authGrantType: 'password',
    authAccountName: process.env.AUTH_ACCOUNT_NAME,
    authCompany: process.env.AUTH_COMPANY_NAME,
    authUserName: process.env.AUTH_USERNAME,
    authPassword: process.env.AUTH_PASSWORD,
    baseUrl: process.env.BASE_URL,
    oauthEndpoint: process.env.OAUTH_ENDPOINT,
  });

  try {
    // Login
    console.log('Logging in...');
    await client.login();
    console.log('✓ Logged in successfully\n');

    // 1. List available optimization plugins (policies)
    console.log('--- Optimization Plugins ---');
    const plugins = await client.optimizationAPI.plugins.list({ size: 10 });
    if (plugins && plugins.results.length > 0) {
      console.log(`Found ${plugins.totalElements} optimization policies:`);
      plugins.results.forEach(plugin => {
        console.log(`  - ${plugin.name} (v${plugin.version}) - Active: ${plugin.active}`);
      });
    } else {
      console.log('No optimization plugins found');
    }
    console.log('');

    // 2. Find best matching technicians for an activity
    // Note: Replace 'YOUR_ACTIVITY_ID' with an actual activity ID
    const activityId = 'YOUR_ACTIVITY_ID';
    if (activityId !== 'YOUR_ACTIVITY_ID') {
      console.log('--- Best Matching Technicians ---');
      console.log(`Finding best technicians for activity: ${activityId}`);
      
      const technicians = await client.optimizationAPI.bestMatchingTechnicians.find(activityId, {
        policy: 'DistanceAndSkills',
        start: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        end: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
        schedulingOptions: {
          maxResults: 5
        }
      });

      if (technicians && technicians.results.length > 0) {
        console.log(`Found ${technicians.results.length} matching technicians:`);
        technicians.results.forEach((tech, index) => {
          console.log(`  ${index + 1}. Person ID: ${tech.personId} - Score: ${tech.score}`);
          if (tech.distanceMeters) {
            console.log(`     Distance: ${(tech.distanceMeters / 1000).toFixed(2)} km`);
          }
        });
      } else {
        console.log('No matching technicians found');
      }
      console.log('');
    }

    // 3. Search for available time slots
    if (activityId !== 'YOUR_ACTIVITY_ID') {
      console.log('--- Job Slot Search ---');
      console.log('Searching for available time slots...');
      
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const slots = await client.optimizationAPI.jobSlots.search({
        activityId: activityId,
        slots: [
          {
            start: new Date(tomorrow.setHours(8, 0, 0, 0)).toISOString(),
            end: new Date(tomorrow.setHours(10, 0, 0, 0)).toISOString()
          },
          {
            start: new Date(tomorrow.setHours(14, 0, 0, 0)).toISOString(),
            end: new Date(tomorrow.setHours(16, 0, 0, 0)).toISOString()
          }
        ],
        resources: {
          includeNonSchedulable: false
        },
        options: {
          maxResults: 10,
          defaultDrivingTimeMinutes: 30
        },
        policy: 'DistanceAndSkills'
      });

      if (slots && slots.results.length > 0) {
        console.log(`Found ${slots.results.length} available slots:`);
        slots.results.forEach((slot, index) => {
          console.log(`  ${index + 1}. Person: ${slot.personId}`);
          console.log(`     Time: ${new Date(slot.start).toLocaleString()} - ${new Date(slot.end).toLocaleString()}`);
          console.log(`     Score: ${slot.score}`);
        });
      } else {
        console.log('No available slots found');
      }
      console.log('');
    }

    // 4. List recent optimization executions
    console.log('--- Recent Optimization Executions ---');
    const executions = await client.optimizationAPI.executions.list({
      page: 0,
      size: 5,
      sort: 'enqueuedAt,desc'
    });

    if (executions && executions.results.length > 0) {
      console.log(`Found ${executions.totalElements} executions (showing latest 5):`);
      executions.results.forEach(exec => {
        console.log(`  - Task ${exec.taskId}`);
        console.log(`    Policy: ${exec.policyName || 'N/A'}`);
        console.log(`    Status: ${exec.status}`);
        console.log(`    Jobs: ${exec.jobCount || 0}, Resources: ${exec.resourceCount || 0}`);
        if (exec.enqueuedAt) {
          console.log(`    Enqueued: ${new Date(exec.enqueuedAt).toLocaleString()}`);
        }
      });
    } else {
      console.log('No executions found');
    }
    console.log('');

    // 5. List processed jobs
    console.log('--- Processed Jobs ---');
    const processedJobs = await client.optimizationAPI.processedJobs.list({
      page: 0,
      size: 10
    });

    if (processedJobs && processedJobs.results.length > 0) {
      console.log(`Found ${processedJobs.totalElements} processed jobs (showing 10):`);
      processedJobs.results.forEach(job => {
        console.log(`  - Activity: ${job.activityId}`);
        console.log(`    Change: ${job.assignmentChangeCategory}`);
        if (job.personId) {
          console.log(`    Assigned to: ${job.personId}`);
        }
      });
    } else {
      console.log('No processed jobs found');
    }
    console.log('');

    // Example: Execute re-optimization (commented out to avoid unintended changes)
    /*
    console.log('--- Re-Optimization ---');
    const reOptResult = await client.optimizationAPI.reOptimization.execute({
      activityIds: ['ACTIVITY_ID_1', 'ACTIVITY_ID_2'],
      optimizationPlugin: 'DistanceAndSkills',
      start: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      end: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      simulation: true, // Set to true for testing
      resources: {
        includeNonSchedulable: false
      }
    });

    if (reOptResult) {
      console.log('Re-optimization initiated:');
      console.log(`  Success: ${reOptResult.result}`);
      if (reOptResult.optimizationTaskIds) {
        console.log(`  Task IDs: ${reOptResult.optimizationTaskIds.join(', ')}`);
      }
    }
    */

    console.log('✓ All optimization API operations completed successfully');

  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response);
    }
  }

})();
