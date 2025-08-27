[33me050be2[m[33m ([m[1;36mHEAD[m[33m -> [m[1;32mmain[m[33m, [m[1;31morigin/main[m[33m, [m[1;31morigin/HEAD[m[33m)[m fix: 修復導師性別字段返回null的問題 - 修改select語句從tutorProfile.gender改為tutorProfile - 在所有格式化結果中添加性別信息 - 為mock數據設置默認性別值
[33m6ee73b7[m 修正MongoDB查詢：明確指定tutorProfile.gender字段，確保能正確獲取嵌套的性別信息
[33med3d7e6[m 修正導師API性別信息：在正確的controller文件中添加subjects和gender字段，並添加詳細調試日誌
[33m3064df2[m 添加詳細的API調試日誌：顯示請求和響應的完整body，幫助診斷性別信息問題
[33m2624670[m 修正導師列表API性別信息：添加調試日誌，確保正確返回tutorProfile.gender
