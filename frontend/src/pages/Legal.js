import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails, 
  Tabs, 
  Tab,
  Paper,
  Divider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import axios from 'axios';

const Legal = () => {
  const [faqs, setFaqs] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('一般問題');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/faqs');
        if (response.data.success) {
          setFaqs(response.data.data);
        }
      } catch (err) {
        setError('無法載入常見問題，請稍後再試');
        console.error('載入常見問題失敗:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFAQs();
  }, []);

  const handleCategoryChange = (event, newValue) => {
    setSelectedCategory(newValue);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const renderFAQ = () => (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs
          value={selectedCategory}
          onChange={handleCategoryChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
        >
          {Object.keys(faqs).map((category) => (
            <Tab key={category} label={category} value={category} />
          ))}
        </Tabs>
      </Box>

      {faqs[selectedCategory]?.map((faq, index) => (
        <Accordion key={index} sx={{ mb: 2 }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              backgroundColor: 'primary.light',
              '&:hover': {
                backgroundColor: 'primary.main',
                color: 'white',
              },
            }}
          >
            <Typography variant="h6">{faq.question}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
              {faq.answer}
            </Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );

  const renderTerms = () => (
    <Box>
      <Typography variant="h4" gutterBottom>
        條款及細則
      </Typography>
      <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.default' }}>
        <Typography variant="body1" paragraph>
          1. 服務使用條款
        </Typography>
        <Typography variant="body2" paragraph sx={{ pl: 2 }}>
          1.1 用戶必須遵守所有適用的法律法規。
        </Typography>
        <Typography variant="body2" paragraph sx={{ pl: 2 }}>
          1.2 用戶不得利用本平台進行任何違法或不當行為。
        </Typography>

        <Typography variant="body1" paragraph sx={{ mt: 3 }}>
          2. 帳戶管理
        </Typography>
        <Typography variant="body2" paragraph sx={{ pl: 2 }}>
          2.1 用戶必須提供真實、準確的個人資料。
        </Typography>
        <Typography variant="body2" paragraph sx={{ pl: 2 }}>
          2.2 用戶應妥善保管其帳戶密碼，對帳戶的所有活動負責。
        </Typography>

        <Typography variant="body1" paragraph sx={{ mt: 3 }}>
          3. 服務內容
        </Typography>
        <Typography variant="body2" paragraph sx={{ pl: 2 }}>
          3.1 本平台保留隨時修改或終止服務的權利。
        </Typography>
        <Typography variant="body2" paragraph sx={{ pl: 2 }}>
          3.2 本平台不保證服務的連續性和完整性。
        </Typography>
      </Paper>
    </Box>
  );

  const renderPrivacy = () => (
    <Box>
      <Typography variant="h4" gutterBottom>
        隱私政策
      </Typography>
      <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.default' }}>
        <Typography variant="body1" paragraph>
          1. 資料收集
        </Typography>
        <Typography variant="body2" paragraph sx={{ pl: 2 }}>
          1.1 我們收集的個人資料包括但不限於：姓名、電子郵件、聯絡電話等。
        </Typography>
        <Typography variant="body2" paragraph sx={{ pl: 2 }}>
          1.2 我們只收集必要的個人資料，以提供更好的服務。
        </Typography>

        <Typography variant="body1" paragraph sx={{ mt: 3 }}>
          2. 資料使用
        </Typography>
        <Typography variant="body2" paragraph sx={{ pl: 2 }}>
          2.1 您的個人資料將用於提供服務、改善用戶體驗等目的。
        </Typography>
        <Typography variant="body2" paragraph sx={{ pl: 2 }}>
          2.2 未經您的同意，我們不會向第三方分享您的個人資料。
        </Typography>

        <Typography variant="body1" paragraph sx={{ mt: 3 }}>
          3. 資料安全
        </Typography>
        <Typography variant="body2" paragraph sx={{ pl: 2 }}>
          3.1 我們採取適當的技術和組織措施保護您的個人資料。
        </Typography>
        <Typography variant="body2" paragraph sx={{ pl: 2 }}>
          3.2 我們定期審查和更新安全措施。
        </Typography>
      </Paper>
    </Box>
  );

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Typography variant="h5" align="center">
          載入中...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Typography variant="h5" color="error" align="center">
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography variant="h3" component="h1" align="center" gutterBottom>
        法律條款
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
        >
          <Tab label="常見問題" />
          <Tab label="條款及細則" />
          <Tab label="隱私政策" />
        </Tabs>
      </Box>

      <Box sx={{ mt: 4 }}>
        {activeTab === 0 && renderFAQ()}
        {activeTab === 1 && renderTerms()}
        {activeTab === 2 && renderPrivacy()}
      </Box>
    </Container>
  );
};

export default Legal; 