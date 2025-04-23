const categories = [
  {
    id: 1,
    name: "幼兒教育",
    icon: "child_care",
    description: "專注於幼兒早期發展與學習",
    subcategories: [
      {
        id: 11,
        name: "SEN 支援",
        description: "特殊教育需求支援服務"
      },
      {
        id: 12,
        name: "Playgroup",
        description: "幼兒遊戲學習小組"
      },
      {
        id: 13,
        name: "面試班",
        description: "幼稚園面試準備課程"
      },
      {
        id: 14,
        name: "英語班",
        description: "幼兒英語啟蒙課程"
      },
      {
        id: 15,
        name: "數學啟蒙",
        description: "幼兒數學思維培養"
      },
      {
        id: 16,
        name: "創意藝術／手工",
        description: "幼兒藝術創作與手工活動"
      }
    ]
  },
  {
    id: 2,
    name: "中小學教育",
    icon: "school",
    description: "中小學學科輔導與補習",
    subcategories: [
      {
        id: 21,
        name: "小學學科",
        description: "小學各科輔導",
        subcategories: [
          {
            id: 211,
            name: "中文科",
            description: "小學中文課程"
          },
          {
            id: 212,
            name: "英文科",
            description: "小學英文課程"
          },
          {
            id: 213,
            name: "數學科",
            description: "小學數學課程"
          },
          {
            id: 214,
            name: "常識科",
            description: "小學常識課程"
          }
        ]
      },
      {
        id: 22,
        name: "中學學科",
        description: "中學各科輔導",
        subcategories: [
          {
            id: 221,
            name: "中國文化科",
            description: "中學中國文化課程"
          },
          {
            id: 222,
            name: "英文科",
            description: "中學英文課程"
          },
          {
            id: 223,
            name: "數學科（包括 M1/M2）",
            description: "中學數學課程"
          },
          {
            id: 224,
            name: "化學科",
            description: "中學化學課程"
          },
          {
            id: 225,
            name: "物理科",
            description: "中學物理課程"
          },
          {
            id: 226,
            name: "生物科",
            description: "中學生物課程"
          },
          {
            id: 227,
            name: "通識教育",
            description: "中學通識課程"
          },
          {
            id: 228,
            name: "經濟／BAFS",
            description: "中學經濟與商業課程"
          }
        ]
      }
    ]
  },
  {
    id: 3,
    name: "興趣班",
    icon: "sports_esports",
    description: "多元化興趣發展課程",
    subcategories: [
      {
        id: 31,
        name: "籃球班",
        description: "籃球技巧訓練"
      },
      {
        id: 32,
        name: "足球班",
        description: "足球技巧訓練"
      },
      {
        id: 33,
        name: "棋藝班",
        description: "各類棋藝教學"
      },
      {
        id: 34,
        name: "繪畫班",
        description: "繪畫技巧與藝術創作"
      },
      {
        id: 35,
        name: "音樂班",
        description: "音樂理論與演奏技巧"
      },
      {
        id: 36,
        name: "魔術班",
        description: "魔術技巧教學"
      },
      {
        id: 37,
        name: "朗誦訓練",
        description: "朗誦技巧與表演"
      },
      {
        id: 38,
        name: "科學實驗",
        description: "趣味科學實驗課程"
      }
    ]
  },
  {
    id: 4,
    name: "大專補習課程",
    icon: "college",
    description: "大專院校學術支援課程",
    subcategories: [
      {
        id: 41,
        name: "Academic Writing",
        description: "學術寫作技巧"
      },
      {
        id: 42,
        name: "IELTS／TOEFL 寫作與口說",
        description: "英語考試準備課程"
      },
      {
        id: 43,
        name: "大學專科導修",
        description: "各學科專業輔導"
      },
      {
        id: 44,
        name: "Calculus／Algebra 解題班",
        description: "高等數學解題技巧"
      },
      {
        id: 45,
        name: "Case Study Coaching",
        description: "個案研究分析技巧"
      },
      {
        id: 46,
        name: "PowerPoint 報告技巧",
        description: "簡報製作與演講技巧"
      },
      {
        id: 47,
        name: "面試／升學支援",
        description: "升學面試準備"
      }
    ]
  },
  {
    id: 5,
    name: "成人教育",
    icon: "work",
    description: "成人專業技能培訓",
    subcategories: [
      {
        id: 51,
        name: "駕駛學習",
        description: "駕駛技巧培訓"
      },
      {
        id: 52,
        name: "投資理財",
        description: "投資理財知識與技巧"
      },
      {
        id: 53,
        name: "烘焙甜點",
        description: "烘焙與甜點製作"
      },
      {
        id: 54,
        name: "語言班",
        description: "各類語言學習"
      },
      {
        id: 55,
        name: "履歷／面試訓練",
        description: "求職技巧培訓"
      },
      {
        id: 56,
        name: "Office 軟件技能",
        description: "辦公室軟件應用"
      }
    ]
  }
];

module.exports = categories; 