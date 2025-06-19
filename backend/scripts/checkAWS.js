require('dotenv').config();

const checkAWS = () => {
  console.log('🔍 AWS Environment Variables Check:');
  console.log('=====================================');
  
  // 檢查 AWS 相關環境變數
  const awsVars = {
    'AWS_ACCESS_KEY_ID': process.env.AWS_ACCESS_KEY_ID,
    'AWS_SECRET_ACCESS_KEY': process.env.AWS_SECRET_ACCESS_KEY,
    'AWS_REGION': process.env.AWS_REGION,
    'AWS_S3_BUCKET_NAME': process.env.AWS_S3_BUCKET_NAME
  };
  
  let allPresent = true;
  
  Object.entries(awsVars).forEach(([key, value]) => {
    const exists = !!value;
    const masked = value ? value.substring(0, 4) + '****' + value.substring(value.length - 4) : 'NOT_SET';
    
    console.log(`- ${key}: ${exists ? '✅ Present' : '❌ Missing'}`);
    if (exists) {
      console.log(`  Value: ${masked}`);
      console.log(`  Length: ${value.length}`);
    }
    
    if (!exists) {
      allPresent = false;
    }
  });
  
  console.log('\n📊 Summary:');
  if (allPresent) {
    console.log('✅ All AWS environment variables are present');
  } else {
    console.log('❌ Some AWS environment variables are missing');
    console.log('💡 Please set the missing variables in your .env file');
  }
  
  console.log('\n🔧 Required .env variables for AWS S3:');
  console.log('AWS_ACCESS_KEY_ID=your_access_key_id');
  console.log('AWS_SECRET_ACCESS_KEY=your_secret_access_key');
  console.log('AWS_REGION=ap-southeast-2');
  console.log('AWS_S3_BUCKET_NAME=hihitutor-uploads');
};

checkAWS(); 