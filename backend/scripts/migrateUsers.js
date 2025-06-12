require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');

const usersPath = path.join(__dirname, '../data/users.json');

async function generateNextUserId() {
  const lastUser = await User.findOne({ userId: { $exists: true } }).sort({ userId: -1 });
  let newId = lastUser ? parseInt(lastUser.userId, 10) + 1 : 1000001;
  return newId.toString().padStart(7, '0');
}

async function generateNextTutorId() {
  const lastTutor = await User.findOne({ tutorId: { $exists: true } }).sort({ tutorId: -1 });
  let prefix = 'AA';
  let number = 1;
  if (lastTutor && lastTutor.tutorId) {
    prefix = lastTutor.tutorId.slice(0, 2);
    number = parseInt(lastTutor.tutorId.slice(2), 10) + 1;
    if (number > 9999) {
      const firstChar = prefix.charCodeAt(0);
      const secondChar = prefix.charCodeAt(1);
      if (secondChar < 90) {
        prefix = String.fromCharCode(firstChar, secondChar + 1);
      } else if (firstChar < 90) {
        prefix = String.fromCharCode(firstChar + 1, 65);
      } else {
        throw new Error('tutorId 已達上限');
      }
      number = 1;
    }
  }
  return `${prefix}${number.toString().padStart(4, '0')}`;
}

async function generateNextOrgId() {
  const orgUsers = await User.find({ orgId: { $exists: true } }).sort({ orgId: 1 });
  let maxOrgId = 'ORG0000';
  if (orgUsers.length > 0) {
    maxOrgId = orgUsers[orgUsers.length - 1].orgId;
  }
  // 解析 orgId
  let prefix = 'ORG';
  let letter = '';
  let number = 0;
  if (maxOrgId.length === 7) { // ORG0001 ~ ORG9999
    number = parseInt(maxOrgId.slice(3), 10) + 1;
    if (number > 9999) {
      letter = 'A';
      number = 1;
    }
  } else if (maxOrgId.length === 8) { // ORGA0001 ~ ORGZ9999
    letter = maxOrgId[3];
    number = parseInt(maxOrgId.slice(4), 10) + 1;
    if (number > 9999) {
      letter = String.fromCharCode(letter.charCodeAt(0) + 1);
      number = 1;
    }
  }
  if (letter) {
    return `${prefix}${letter}${number.toString().padStart(4, '0')}`;
  } else {
    return `${prefix}${number.toString().padStart(4, '0')}`;
  }
}

async function migrateUserIds() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const users = await User.find({});
    let nextUserId = parseInt((await generateNextUserId()), 10);
    let nextTutorId = await generateNextTutorId();
    let nextOrgId = await generateNextOrgId();

    // 先收集現有所有 userId/tutorId/orgId，避免重覆
    const usedUserIds = new Set(users.map(u => u.userId).filter(Boolean));
    const usedTutorIds = new Set(users.map(u => u.tutorId).filter(Boolean));
    const usedOrgIds = new Set(users.map(u => u.orgId).filter(Boolean));

    for (const user of users) {
      let updated = false;
      // userId
      if (!user.userId) {
        while (usedUserIds.has(nextUserId.toString().padStart(7, '0'))) {
          nextUserId++;
        }
        user.userId = nextUserId.toString().padStart(7, '0');
        usedUserIds.add(user.userId);
        nextUserId++;
        updated = true;
        console.log(`🆔 user ${user._id} 補 userId: ${user.userId}`);
      }
      // tutorId
      if (user.userType === 'tutor' && !user.tutorId) {
        // 生成唯一 tutorId
        let tryTutorId = nextTutorId;
        while (usedTutorIds.has(tryTutorId)) {
          // 遞增 tutorId
          let prefix = tryTutorId.slice(0, 2);
          let number = parseInt(tryTutorId.slice(2), 10) + 1;
          if (number > 9999) {
            const firstChar = prefix.charCodeAt(0);
            const secondChar = prefix.charCodeAt(1);
            if (secondChar < 90) {
              prefix = String.fromCharCode(firstChar, secondChar + 1);
            } else if (firstChar < 90) {
              prefix = String.fromCharCode(firstChar + 1, 65);
            } else {
              throw new Error('tutorId 已達上限');
            }
            number = 1;
          }
          tryTutorId = `${prefix}${number.toString().padStart(4, '0')}`;
        }
        user.tutorId = tryTutorId;
        usedTutorIds.add(user.tutorId);
        // 計算下一個 tutorId
        let prefix = tryTutorId.slice(0, 2);
        let number = parseInt(tryTutorId.slice(2), 10) + 1;
        if (number > 9999) {
          const firstChar = prefix.charCodeAt(0);
          const secondChar = prefix.charCodeAt(1);
          if (secondChar < 90) {
            prefix = String.fromCharCode(firstChar, secondChar + 1);
          } else if (firstChar < 90) {
            prefix = String.fromCharCode(firstChar + 1, 65);
          } else {
            throw new Error('tutorId 已達上限');
          }
          number = 1;
        }
        nextTutorId = `${prefix}${number.toString().padStart(4, '0')}`;
        updated = true;
        console.log(`🎓 user ${user._id} 補 tutorId: ${user.tutorId}`);
      }
      // orgId
      if (user.userType === 'organization' && !user.orgId) {
        // 生成唯一 orgId
        let tryOrgId = nextOrgId;
        while (usedOrgIds.has(tryOrgId)) {
          // 遞增 orgId
          if (tryOrgId.length === 7) {
            let number = parseInt(tryOrgId.slice(3), 10) + 1;
            let letter = '';
            if (number > 9999) {
              letter = 'A';
              number = 1;
            }
            tryOrgId = letter ? `ORG${letter}${number.toString().padStart(4, '0')}` : `ORG${number.toString().padStart(4, '0')}`;
          } else if (tryOrgId.length === 8) {
            let letter = tryOrgId[3];
            let number = parseInt(tryOrgId.slice(4), 10) + 1;
            if (number > 9999) {
              letter = String.fromCharCode(letter.charCodeAt(0) + 1);
              number = 1;
            }
            tryOrgId = `ORG${letter}${number.toString().padStart(4, '0')}`;
          }
        }
        user.orgId = tryOrgId;
        usedOrgIds.add(user.orgId);
        // 計算下一個 orgId
        if (tryOrgId.length === 7) {
          let number = parseInt(tryOrgId.slice(3), 10) + 1;
          let letter = '';
          if (number > 9999) {
            letter = 'A';
            number = 1;
          }
          nextOrgId = letter ? `ORG${letter}${number.toString().padStart(4, '0')}` : `ORG${number.toString().padStart(4, '0')}`;
        } else if (tryOrgId.length === 8) {
          let letter = tryOrgId[3];
          let number = parseInt(tryOrgId.slice(4), 10) + 1;
          if (number > 9999) {
            letter = String.fromCharCode(letter.charCodeAt(0) + 1);
            number = 1;
          }
          nextOrgId = `ORG${letter}${number.toString().padStart(4, '0')}`;
        }
        updated = true;
        console.log(`🏢 user ${user._id} 補 orgId: ${user.orgId}`);
      }
      if (updated) await user.save();
    }
    console.log('✅ Migration complete!');
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateUserIds(); 