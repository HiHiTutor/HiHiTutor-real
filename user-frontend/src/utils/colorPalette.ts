interface ColorClass {
  bg: string
  text: string
}

// 用 tag 判斷背景色、文字色
export const getColorClassByTag = (tag: string): ColorClass => {
  const palette: Record<string, ColorClass> = {
    '寫作': { bg: 'bg-pink-50', text: 'text-pink-800' },
    '英文': { bg: 'bg-blue-50', text: 'text-blue-800' },
    '中文': { bg: 'bg-red-50', text: 'text-red-800' },
    '數學': { bg: 'bg-yellow-50', text: 'text-yellow-800' },
    'DSE': { bg: 'bg-purple-50', text: 'text-purple-800' },
    '導師訪問': { bg: 'bg-green-50', text: 'text-green-800' },
    '升學攻略': { bg: 'bg-indigo-50', text: 'text-indigo-800' },
    '其他': { bg: 'bg-slate-50', text: 'text-gray-800' }
  }

  return palette[tag] || palette['其他']
} 