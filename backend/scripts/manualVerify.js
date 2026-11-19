#!/usr/bin/env node

/**
 * Manual Guide Verification Script
 * Usage: node scripts/manualVerify.js <guide_email>
 * 
 * This script quickly verifies alpha guides without using the admin UI.
 * It should be deleted after admin UI is proven during alpha.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Verification = require('../models/Verification');

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

async function verifyGuide(email) {
  if (!email) {
    console.error('❌ Error: Email is required');
    console.log('\nUsage: node scripts/manualVerify.js <guide_email>');
    process.exit(1);
  }

  try {
    // Connect to database
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find user
    console.log(`🔍 Looking for guide with email: ${email}`);
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      console.error(`❌ Error: No user found with email "${email}"`);
      process.exit(1);
    }

    if (user.role !== 'guide') {
      console.error(`❌ Error: User "${email}" is not a guide (role: ${user.role})`);
      console.log('\n💡 Tip: Only users with role "guide" can be verified');
      process.exit(1);
    }

    // Check if already verified
    if (user.verified && user.verification_status === 'verified') {
      console.log(`⚠️  Guide "${user.name}" (${email}) is already verified`);
      console.log(`   Status: ${user.verification_status}`);
      console.log(`   Verified: ${user.verified}`);
      process.exit(0);
    }

    // Create or update verification record
    let verification = await Verification.findOne({ guide_id: user._id });

    if (!verification) {
      console.log('📝 Creating new verification record...');
      verification = new Verification({
        guide_id: user._id,
        status: 'verified',
        documents: [
          {
            type: 'other',
            url: 'manual-verification-alpha',
            uploaded_at: new Date(),
          }
        ],
        admin_notes: 'Manually verified for alpha launch',
      });
    } else {
      console.log('📝 Updating existing verification record...');
      verification.status = 'verified';
      verification.admin_notes = 'Manually verified for alpha launch';
    }

    verification.history.push({
      status: 'verified',
      changed_at: new Date(),
      notes: 'Manual verification via script for alpha launch',
    });

    await verification.save();

    // Update user record
    console.log('👤 Updating user record...');
    user.verified = true;
    user.verification_status = 'verified';
    await user.save();

    console.log('\n✅ SUCCESS! Guide verified:');
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   City: ${user.city || 'Not set'}`);
    console.log(`   Status: ${user.verification_status}`);
    console.log(`   Verified: ${user.verified}`);
    console.log(`\n🎉 ${user.name} is now a verified guide on Tourmitra!`);

  } catch (error) {
    console.error('\n❌ Error occurred:');
    console.error(error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 Disconnected from MongoDB');
  }
}

// Get email from command line arguments
const email = process.argv[2];

// Run verification
verifyGuide(email);
