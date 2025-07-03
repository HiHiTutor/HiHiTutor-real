'use client';

import React from 'react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">服務條款</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="mb-6">
              歡迎你登記為 HiHiTutor 的導師。我們希望各位登記成為我們導師之前，首先參閱導師收費說明及導師合約的完整內容。完成登記後即代表完全明白有關內容，並會遵守所有條款。
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">導師合約條款</h2>
            <p className="mb-6">
              歡迎您登記為HiHiTutor的導師，登記前請各導師參閱「導師收費」的說明，以下乃閣下須就使用HiHiTutor網站及其提供之服務需要遵守之條款和規則。當完成導師登記後，即表示你同意接受這些條款和規則之約束。
            </p>
            <p className="mb-6">
              「本站」是指HiHiTutor網站及同系之網站。 本站可隨時修訂合約內容，修訂條款會在此網站內張貼。新修訂條款將於張貼七天後自動生效。因此，閣下應該定期檢視HiHiTutor網站留意條款所作出之更改。倘於該等條款作出任何更改後，閣下仍繼續使用本網站或本網站提供的服務，則表示接納該等更改。
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-4">1. 定義</h3>
            <h4 className="text-lg font-medium text-gray-900 mt-4 mb-2">1.1 詞彙之定義</h4>
            <p className="mb-4">以下詞彙在此合約中具下列定義：</p>
            <ul className="list-disc pl-6 mb-6">
              <li>「個案確認(confirm)／接受個案」指此本站職員如在電話/ WhatsApp對話中表明「個案已經confirm／確認」，如導師沒有提出反對，個案已被視為「已確認／confirm／已接受／已接納」。</li>
              <li>「全科」指該級別之全級常規科目，小學科目則為「中文、英文、數學、常識、普通話」，中學科目則需按個別學校情況而定，另功課輔導即等同全科補習。</li>
              <li>「導師／家長／HiHiTutor三方關係」指導師與家長之關係為服務合作關係，其間只為獨立合作聘約，並不存在僱傭關係；導師與此網站亦只存在服務提供者與服務使用者之關係，雙方沒有任何僱傭關係，服務亦與「職業介紹」完全無關。</li>
              <li>「會員合約」指此網站的任何一部分所示指引、指南、內容、條款、說明，均為會員合約之一部分，此網站有權依據合約收取費用，成功登記即代表導師同意所有條款。</li>
              <li>「導師登記」指導師於此網站上進行登記，法律上與實體合約無異。</li>
              <li>「欺騙行為」指會員導師虛報資料登記／行騙／與學生或家長串聯行騙。</li>
            </ul>

            <h4 className="text-lg font-medium text-gray-900 mt-4 mb-2">1.2 標題</h4>
            <p className="mb-6">
              此合約中的標題只為方便閱讀而設，並非此合約內容的一部份，絕不會影響對此合約或其任何部份的解釋。
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-4">2. 提供服務</h3>
            <h4 className="text-lg font-medium text-gray-900 mt-4 mb-2">2.1 使用</h4>
            <p className="mb-4">任何人士欲以導師身份使用此網站的服務，必須先登記為本站導師。</p>

            <h4 className="text-lg font-medium text-gray-900 mt-4 mb-2">2.2 登記成為本站導師</h4>
            <p className="mb-4">用戶向HiHiTutor提供所有需要資料及網上填妥表格，按下「確認」鍵後即成為本站導師。HiHiTutor保留拒絕任何導師申請而不作任何解釋的權利。</p>

            <h4 className="text-lg font-medium text-gray-900 mt-4 mb-2">2.3 存取、更正或刪除個人資料的權利</h4>
            <p className="mb-4">若你對於我們如何處理你的個人數據有任何疑問、意見或欲投訴，或你希望不再以導師身份使用我們的服務，請透過電話95011159與我們聯繫。此外，根據要求，你可以修改、更正或更新你的個人數據，或提出申請將你的個人數據從我們的資料庫中刪除。</p>

            <h4 className="text-lg font-medium text-gray-900 mt-4 mb-2">2.4 所收集的個人資料的目的</h4>
            <p className="mb-4">公司將基於以下目的來使用對您收集的個人資料和資訊：</p>
            <ul className="list-disc pl-6 mb-6">
              <li>登記、註冊和識別：
                <ul className="list-disc pl-6">
                  <li>登記，以及在本網站上註冊使用者帳戶；</li>
                  <li>以驗證和確認您的身份；以及</li>
                  <li>驗證教師的學術資格。</li>
                </ul>
              </li>
              <li>提供服務：在本網站上向您提供服務，以及允許您參加本網站上的其他活動，包括但不限於競賽、促銷、活動、投票和調查；</li>
              <li>基於行政、管理和技術支援原因：
                <ul className="list-disc pl-6">
                  <li>基於我們的內部管理和管理原因，包括稽核和內部分析；</li>
                  <li>為了與您溝通、提供適當的技術支援、獲得您的意見和處理您的投訴；以及</li>
                  <li>為了偵測、調查和避免任何欺詐、受禁止與非法活動，對本網站的任何濫用，或以不當或不實的動機來使用本網站，以及在必要時，提供或回應法院、執法機構或您所在國家的類似機關與法定機構的請求或指示。</li>
                </ul>
              </li>
              <li>統計：進行統計和資料分析，以改善和強化我們的服務和發展我們的行銷策略；以及</li>
              <li>分析：建立您的使用者資料檔。</li>
            </ul>

            <h4 className="text-lg font-medium text-gray-900 mt-4 mb-2">2.5 刪除HiHiTutor帳戶</h4>
            <p className="mb-4">你可隨時要求刪除個人帳戶並終止與我們的關係，而無需就此支付費用。在你要求刪去帳戶時，我們會取消你任何未進行配對的申請，但即使在你的HiHiTutor帳戶關閉後，你仍需承擔與你HiHiTutor帳戶相關的此前所有配對了的補習個案義務。而在刪除帳戶前，你亦須完成所有HiHiTutor帳戶中的個案退款申索或積分換領（如有），否則帳號一經移除，均不得作任何追溯。</p>
            <p className="mb-4">以下情況將無法刪除帳戶：</p>
            <ul className="list-disc pl-6 mb-6">
              <li>為規避差評/黑名單紀錄。</li>
              <li>你有正在配對中的個案。</li>
              <li>你有未解決的糾紛、投訴。</li>
              <li>你有行政費罰款尚未完成處理。</li>
              <li>你提供了（疑似）虛假或偽造的學術背景/成績證明文件/自我介紹資料。</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-4">3. 導師登記資格</h3>
            <p className="mb-6">
              年滿十五歲或以上，具中四或以上程度學歷之自然人且擁有簽訂合約的心智和法律能力之人士，以及獲其憲章、附例及公司組織章程大綱批准其與HiHiTutor簽訂此合約的公司，方可申請成為導師。HiHiTutor保留拒絕任何人士申請成為會員或終止任何人士之導師資格而不作任何解釋之權利。不符合上述資格者不得使用服務。
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-4">4. 收費</h3>
            <h4 className="text-lg font-medium text-gray-900 mt-4 mb-2">4.1 導師收費說明</h4>
            <p className="mb-4">使用服務中收費（「收費」）列於「導師收費說明」（收費說明）中，而該收費說明乃巳納入本合約中，並視為構成合約的一部份。HiHiTutor保留隨時更改有關收費的權利，而新收費將於指定日期生效（生效日期將為網頁刊登經修訂收費表後的七天內）。所有用戶必須於每次使用服務前查核收費表。</p>

            <h4 className="text-lg font-medium text-gray-900 mt-4 mb-2">4.2 繳費方法</h4>
            <p className="mb-4">收費按以下方法繳付：倘用戶為自然人，則須透過銀行轉賬或PayPal或本站提供之其他方式付費予HiHiTutor；倘若任何用戶不準時繳費，HiHiTutor有權暫停該用戶的導師資格及暫停提供服務，直至到用戶繳費為止。該用戶須在HiHiTutor要求下付尚欠金額的利息，按每月2%之利率繳付日息，從繳費到期日起計算，直至付款為止。此款項為逾期繳費的算定損害賠償，並非罰款。另外，HiHiTutor有權在客戶過期未有繳款之十天後加收總結欠再加上10%的罰款；如HiHiTutor會最終交由香港特別行政區合法收賬公司及由律師發出相關信件代行收取，導師除了需繳付有關服務費用、利息及相關罰款之同時，導師並必須繳付一切因其欠款所衍生之收賬公司之服務費用或佣金、律師及法律事務費用。</p>

            <h4 className="text-lg font-medium text-gray-900 mt-4 mb-2">4.3 貨幣</h4>
            <p className="mb-4">除非另有所指，所有收費均以港幣為單位。</p>

            <h4 className="text-lg font-medium text-gray-900 mt-4 mb-2">4.4 其他雜費</h4>
            <p className="mb-6">所有適用之稅項，以及在閣下使用HiHiTutor所帶來的收入而衍生之稅務情況，一概由閣下負責。HiHiTutor可全權酌情決定隨時增加、刪減或更改部份或全部服務。</p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-4">5. HiHiTutor 職責</h3>
            <h4 className="text-lg font-medium text-gray-900 mt-4 mb-2">5.1 角色僅為教育平台</h4>
            <p className="mb-4">HiHiTutor作為一個教育平台，其責任僅為導師及家長或學生進行相互配對，以使導師可以向家長或學生提供補習服務, 其間只為獨立合作聘約，並不存在僱傭關係；導師與HiHiTutor亦只存在服務提供者與服務使用者之關係，雙方沒有任何僱傭關係，因此HiHiTutor有權依本公司與導師所訂定之「導師條款」收取行政費用，成功登記即代表導師同意條款全部內容。而「導師條款」所訂之內容等同HiHiTutor與導師之間所定之合約，而HiHiTutor網站內所列出的任何規則或指示都屬於會員合約的一部份，本站導師亦須格守。</p>

            <h4 className="text-lg font-medium text-gray-900 mt-4 mb-2">5.2 不擔保家長或學生對導師要求之合理性</h4>
            <p className="mb-4">HiHiTutor明確聲明並沒有預先與家長或學生進行面談或家訪，而且家長或學生對導師在道德、學術、修養、教學質素及質量等之合法性、合適性或其他合理性和原則，並不在HiHiTutor控制範圍之內。</p>

            <h4 className="text-lg font-medium text-gray-900 mt-4 mb-2">5.3 不擔保導師人生安全</h4>
            <p className="mb-4">HiHiTutor明確聲明導師的人生安全或其他個人利益得失，亦非HiHiTutor控制範圍之內。HiHiTutor概不接納或承擔有關導師和家長或學生之間之任何法律責任。</p>

            <h4 className="text-lg font-medium text-gray-900 mt-4 mb-2">5.4 不擔保家長或學生長期使用導師</h4>
            <p className="mb-4">基於私人補習是逐次提供補習服務來結算學費的性質，而非簽訂長期合約有離職通知期的合約工作，HiHiTutor概不擔保家長學生或導師長期使用/進行補習服務，家長/學生/導師如使用本站服務，須自行評估可能終止的風險或其他個人利益得失。亦因此，本公司僅建議家長和同學於自行跟導師結算學費時，採用逐堂課繳交學費的方式，以免遇到課堂延期或終止時出現計算混亂的情況及產生學費相關爭拗。月繳/預繳/延繳導師的模式本公司均不建議，如有此類收繳共識，雙方需自行評估及承擔相關學費繳付模式下的風險或其他個人利益得失；而所有人士也必須留意與未屆合法年齡人士、提供虛假理由或沒有訂約的行為能力的人士進行交易所涉及的風險。如引起任何糾紛，與該等糾紛有關或因而引起的所有責任、索償、索求、賠償金（實質或間接），不論屬何性質，已知及未知、懷疑與否、已公開及未公開者，HiHiTutor一概毋須負上有關款項/法律責任。</p>

            <h4 className="text-lg font-medium text-gray-900 mt-4 mb-2">5.5 不擔保家長，學生或導師身份及所述資料的真確性</h4>
            <p className="mb-4">HiHiTutor非執法機關，不能控制家長/學生/導師透過本網站所提供之身份及所述資料的真確性，無法也不能就每一家長/學生/導師之身份及所述資料進行實際確認，而有關保證項目本網站已列於收費說明或服務簡介中，如前所述，該收費說明乃巳納入本合約中，並視為構成合約的一部份。因此，HiHiTutor概不擔保任何人士透過HiHiTutor使用服務所提供之任何資料真確性；閣下接受HiHiTutor所示之資料與家長/學生/導師各方進行交易時，務須自行小心防範欺騙行為，HiHiTutor概不就任何用戶之任何欺瞞行為或遺漏負責。如有需要，家長/學生/導師各方可報警由執法機關處理跟進，HiHiTutor會積極配合執法機關提供所需之資料紀錄。</p>

            <h4 className="text-lg font-medium text-gray-900 mt-4 mb-2">5.6 免除HiHiTutor系統服務器故障與漏洞的相關責任</h4>
            <p className="mb-4">本公司提供之服務涉及到互聯網服務和線上系統，可能會受到各個環節不穩定因素的影響。因此服務存在不可抗力、系統不穩定、電腦病毒或黑客攻擊以及其他任何技術操作、互聯網絡等原因造成的服務中斷或不能滿足用戶要求的風險。有關系統服務器故障和漏洞已造成或可能造成之潛在損失，HiHiTutor一概毋須負上有關賠償和法律責任。</p>

            <h4 className="text-lg font-medium text-gray-900 mt-4 mb-2">5.7 免除HiHiTutor的法律責任</h4>
            <p className="mb-4">若家長或學生與導師之間出現任何糾紛或因使用服務而引起任何糾紛，與該等糾紛有關或因而引起的所有責任、索償、索求、賠償金（實質或間接），不論屬何性質，已知及未知、懷疑與否、已公開及未公開者，HiHiTutor一概毋須負上有關法律責任。</p>

            <h4 className="text-lg font-medium text-gray-900 mt-4 mb-2">5.8 HiHiTutor的支出</h4>
            <p className="mb-6">倘HiHiTutor因應閣下之要求或閣下所涉及的任何訴訟中作出的指令（不論通過傳票或任何具司法管轄權的法院所頒法令，包括遵守任何披露文件之法令或出席法院作證）而引起的所有費用，包括HiHiTutor尋求法律或其他專業意見或陳述時的支出，一概由閣下負責。（在所有此等情況下，一切費用按實際損失計算）</p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-4">6. HiHiTutor 的權利</h3>
            <h4 className="text-lg font-medium text-gray-900 mt-4 mb-2">6.1 暫停或終止用戶資格的權利</h4>
            <p className="mb-4">倘發現用戶出現以下行為，則HiHiTutor有權暫停或終止用戶資格而毋須支付賠償：</p>
            <ul className="list-disc pl-6 mb-6">
              <li>違反本合約所列出之條件及條款，或</li>
              <li>透過定罪、和解、保險或託管調查或其他方式而從事與此網站有關之欺騙行為。</li>
            </ul>

            <h4 className="text-lg font-medium text-gray-900 mt-4 mb-2">6.2 處理由用戶提供的資料的權利</h4>
            <p className="mb-4">HiHiTutor擁有絕對及不受約束之權力，拒絕或刪除用戶所提供之任何資料，而毋須向任何一方發出通知或作出賠償。在無損此項權利下，倘導師所提供之任何資料一旦刊登或繼續刊登，會導致HiHiTutor須為第三者負上任何法律責任，或令HiHiTutor觸犯任何有效司法管轄區的任何法律或規則或第三者的權益，則HiHiTutor擁有權拒絕或修改任何所提供之資料。</p>

            <h4 className="text-lg font-medium text-gray-900 mt-4 mb-2">6.3 撤回提供中介服務之權利</h4>
            <p className="mb-4">HiHiTutor擁有絕對及不受約束的權利，撤回任何服務條件而不向導師發出任何通知或作出任何賠償。在無減損此權利下，倘發生下列情況，HiHiTutor有權撤回服務：</p>
            <ul className="list-disc pl-6 mb-6">
              <li>該導師提供有個人資料有極大可能不全正確；</li>
              <li>導師被發現違反本合約列出的條件及條款，或其戶口被HiHiTutor根據此合約的條款勒令暫停；</li>
              <li>HiHiTutor因任何原因無法核實或證實導師或家長或學生提供的任何資料。</li>
            </ul>

            <h4 className="text-lg font-medium text-gray-900 mt-4 mb-2">6.4 拒絕提供服務之權利</h4>
            <p className="mb-4">HiHiTutor有權停止提供服務給任何會員並保留拒絕任何人士申請成為會員或終止任何人士之會員資格而不作任何解釋之權利。</p>

            <h4 className="text-lg font-medium text-gray-900 mt-4 mb-2">6.5 更改有關收費的權利</h4>
            <p className="mb-4">使用服務中收費列於「導師收費說明」中，而該收費說明乃已納入本合約中，視為構成合約的一部份。HiHiTutor保留隨時更改有關收費的權利。所有用戶必須於每次使用服務前查核收費表。</p>

            <h4 className="text-lg font-medium text-gray-900 mt-4 mb-2">6.6 增刪本合約的權利</h4>
            <p className="mb-6">HiHiTutor保留隨時增刪本合約的一切權利，而不會事先通知會員；會員必須隨時翻看本合約資料，以確保清楚最新的會員約束條款。</p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-4">7. 有關補習中介服務之條款</h3>
            <h4 className="text-lg font-medium text-gray-900 mt-4 mb-2">7.1 導師之基本責任</h4>
            <p className="mb-4">倘閣下，作為導師，確認接納HiHiTutor之個案後，必須盡力依照HiHiTutor所發出的指示，上課務必準時到達及依時完成，不可在沒有家長或學生同意的情況下刪減時間。你同意授權本站利用你的「登記資料」作為本站的宣傳之用，而不受任何法例所限制。你亦同意本站在必要時候局部或全部顯示「登記資料」，而不受任何版權法例及個人資料（私隱）條例所限制。你同意不會使用任何工具、軟件或程序干擾本站伺服器的正常運作，更不會故意、有計劃地令本站的系統負荷過重。你不可以傳播任何電腦病毒或有破壞性的程式給本站和本站的所有會員。你同意不會追究因本站系統失靈而造成的任何損失。本站會盡力維持系統的可靠性，並保持良好的效率。你不可利用任何本站的服務作出非法或不道德的行為。</p>

            <h4 className="text-lg font-medium text-gray-900 mt-4 mb-2">7.2 導師提供正確資料之責任</h4>
            <p className="mb-4">導師如沒有提供正確資料，或因沒有提供正確資料而導師個案服務被終止，HiHiTutor可以拒絕為其提供服務，亦有可以收取所衍生之行政費用。</p>

            <h4 className="text-lg font-medium text-gray-900 mt-4 mb-2">7.3 導師撤回個案所衍生之責任</h4>
            <p className="mb-4">在個案已確認後，如導師決定取消向相關家長或學生提供補習，導師絕不能把其家長或學生之資料轉交予任何人仕。</p>

            <h4 className="text-lg font-medium text-gray-900 mt-4 mb-2">7.4 導師進行欺騙行為之責任</h4>
            <p className="mb-6">導師如被證實，或HiHiTutor認為或發現導師極有可能與家長或學生串聯進行任何欺騙行為，包括導師聲稱終止但仍然為家長或學生提供有關服務、導師和家長其任何一方要求對方配合及向HiHiTutor謊報服務經已終止，HiHiTutor會立即終止有關導師的資格，並要求有關人士於七天內清繳有關全部費用；即使其後家長或學生決定終止有關人士之服務，導師仍須繳付全數服務費用。HiHiTutor會保留一切刑事及民事追究之權利，並不會容忍任何欺騙行為出現。</p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-4">8. 不保證及對不法行為之追究</h3>
            <h4 className="text-lg font-medium text-gray-900 mt-4 mb-2">8.1 按「現狀」基準提供服務</h4>
            <p className="mb-4">HiHiTutor按「現狀」基準提供此網站服務。HiHiTutor之僅有責任已在此合約中列出。除在此合約中清楚列出之事項外，HiHiTutor不會作出任何明確或隱含之保證或條件。HiHiTutor不能保證此網站所設之功能以及所提供之服務將會不受干擾或無誤，或問題將獲修正或此網站或其伺服器將無病毒或其他有害元素。HiHiTutor並不就用戶或用戶使用此網站之後果作保證或任何聲明。</p>

            <h4 className="text-lg font-medium text-gray-900 mt-4 mb-2">8.2 提供付款機制所屬責任</h4>
            <p className="mb-4">提供予用戶之付款機制以及輔助性處理付款設施，乃僅便於用戶使用，而HiHiTutor概不就該等設施提供任何明確或隱含之保證。在任何情況下，HiHiTutor概不就用戶來自或因任何誤差及／或錯誤及／或錯誤扣除或計入信用卡賬戶之錯誤月結單以及任何故障、失靈、中斷、停工時間、干擾、計算錯誤、延誤、失準、損失或數據訛誤或任何其他有關付款渠道設施失靈而蒙受或產生之任何損失、賠償、成本或開支負上責任。</p>

            <h4 className="text-lg font-medium text-gray-900 mt-4 mb-2">8.3 跟據香港特別行政區法例對網上行業／電貿（e-commerce）的規管及法律行駛</h4>
            <p className="mb-4">網際商業與其他實業皆受到相同法律之約束及保障。因此，導師於網上登記，在法律上與實體合約無異，導師虛報資料登記／行騙／與學生或家長串聯行騙，將會被視作犯罪行為；HiHiTutor決不會因為導師年輕或對法律認知不足而不作追究。本公司絕不容忍導師此等違法行為，導師登記時的IP及日後每一個動作的IP亦將被紀錄下來，HiHiTutor亦會在有需要時把曾與導師交談的內容錄音備份，有需要時會以該等資訊舉證。導師請勿因一時貪念致前途盡毀。</p>

            <h4 className="text-lg font-medium text-gray-900 mt-4 mb-2">8.4 本公司職員與導師間之談話</h4>
            <p className="mb-4">本公司職員與導師間之談話間，其對口頭承諾之任何部分，均可視為一個正式協議或合約，並具法律效力，本公司亦可能把部分或全部之對話錄音。</p>

            <h4 className="text-lg font-medium text-gray-900 mt-4 mb-2">8.5 登記資料的責任</h4>
            <p className="mb-6">你必須對你的「登記資料」負責，而本站只是一個被動的資料收集及傳送中介。「登記資料」必須合乎道德，並須保證沒有觸犯任何法律，不含有暴力、色情成份及粗言穢語，以及不可包含任何侵犯私隱權或帶有歧視的成份的內容。若本站認為你的「登記資料」會對任何人或機構造成負面影響，本站將會保留採取法律行動的權利。本站更有權停止顯示你的「登記資料」予所有有權限之查閱者（包括其本人）和因此而永久刪除你的會籍。</p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-4">9. 收費</h3>
            <h4 className="text-lg font-medium text-gray-900 mt-4 mb-2">9.1 收費</h4>
            <p className="mb-4">使用服務中收費（「收費」）列於「導師收費」中，而該收費說明乃巳納入本合約中，並視為構成合約的一部份。HiHiTutor保留隨時更改有關收費的權利，而新收費將於指定日期生效（生效日期將為網頁刊登經修訂收費表後的七天內）。所有用戶必須於每次使用服務前查核收費表。</p>

            <h4 className="text-lg font-medium text-gray-900 mt-4 mb-2">9.2 收費模式</h4>
            <p className="mb-4">家長須透過銀行轉賬/PayPal/或本站提供之其他形式繳交行政費用, 請務必保留收條並將之拍下或掃瞄留底, 並致電聯絡HiHiTutor職員以為個案編號進行核實。</p>

            <h4 className="text-lg font-medium text-gray-900 mt-4 mb-2">9.3 特別情況</h4>
            <p className="mb-4">假如因任何原因而沒有完成應有補習日數或決定取消補習，亦會根據原定補習時數向導師收取一堂堂費作為行政費用。</p>

            <h4 className="text-lg font-medium text-gray-900 mt-4 mb-2">9.4 取消補習的限制</h4>
            <p className="mb-6">任何一方取消補習後，除非經HiHiTutor再次介紹，否則導師必須承諾在六個月之內不能向該學生提供相同或相似的補習服務。導師亦不能轉介該學生之資料予第三者及轉介其他導師之資料予該學生，若發現導師未有繳付行政費用而為該學生提供補習服務及上述轉介資料之情況，本公司必從正常之法律途徑追討其行政費及附加費$2000，另外亦保留收取文件送遞、賬單、蒐集證據之所有費用。無論於HiHiTutor提供介紹前或後而經其他任何途徑獲得該學生之介紹或與學生直接接洽情況下，導師亦不能為該學生提供補習服務。而於任何情況下，若導師為該學生提供相同或相似的補習服務而沒有經書面通知本公司，即時需要繳付上述之所有費用。註: 該學生是指該學生及其家庭之任何學生或該學生相同地址之任何學生。</p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-4">10. 其他事項</h3>
            <h4 className="text-lg font-medium text-gray-900 mt-4 mb-2">10.1 用戶不得：</h4>
            <ul className="list-disc pl-6 mb-6">
              <li>使用任何裝置、軟件或程式干預或企圖干預此網站之正常運作或任何在此網站進行的交易；</li>
              <li>進行任何令本站的基礎設施承受不合理或不合比例的巨大負荷的活動；</li>
              <li>把其密碼向第三者透露或與第三者使用同一密碼或將其密碼用作未經許可的用途。</li>
            </ul>

            <h4 className="text-lg font-medium text-gray-900 mt-4 mb-2">10.2 遵守法律</h4>
            <p className="mb-4">所有用戶在使用本站服務時，須遵守所有適用法律、規程、條例和守則。</p>

            <h4 className="text-lg font-medium text-gray-900 mt-4 mb-2">10.3 概無代理關係</h4>
            <p className="mb-4">本文件任何內容均不會令HiHiTutor與任何人士或公司或其他使用本站或服務之用戶之間構成或建立任何代理、合伙、聯營、僱員／僱主或專營商／專營承辦商之關係。</p>

            <h4 className="text-lg font-medium text-gray-900 mt-4 mb-2">10.4 通知</h4>
            <p className="mb-4">除非特別聲明，所有通知均以電子郵件或電話形式發出，及就用戶而言，倘通知已透過用戶於登記時向HiHiTutor提供的電郵地址或其他由該用戶指定的電郵地址或透過在此網站張貼通知，則已被視作發出通知。HiHiTutor有權以各種形式，包括電郵、郵寄等會訊，如希望不再接收，必須之前電郵通知我們，我們在處理會回覆確實；日後會員如需要再次接收，必須再行電郵通知HiHiTutor。HiHiTutor擁有這份會員合約的最終解釋權。</p>

            <h4 className="text-lg font-medium text-gray-900 mt-4 mb-2">10.5 條款的獨立性</h4>
            <p className="mb-4">倘根據任何具司法管轄權的法院所實際引用的適用法例，此合約中的任何條款屬違法或無法實施，此等條款將與合約分開及視作無效論，而絕不影響此合約的其餘條款。然而，在有關法律容許的情況下，若有關法律條文可獲寬免，各方須同意其獲寬免，以便此合約的有關條款能夠有效、具約束力及得以實施。</p>

            <h4 className="text-lg font-medium text-gray-900 mt-4 mb-2">10.6 網頁之完整性</h4>
            <p className="mb-4">倘閣下利用HiHiTutor系統或任何程序或伺服器漏動，竊取任何資料，閣下須負上一切法律責任。</p>

            <h4 className="text-lg font-medium text-gray-900 mt-4 mb-2">10.7 報行管轄的法律及司法機構</h4>
            <p className="mb-6">
              (a) 本合約受香港特別行政區法律管轄，並依香港特別行政區法律詮釋。<br />
              (b) 與此網站之使用有關或因此而起的任何法律行動或訴訟，任何有關一方須願受香港特別行政區法院的司法管轄權管轄；任何一方不得以有關訴訟被帶到任何不相稱的法院為理由而提出反對。<br />
              (c) 上文所述願受香港特別行政區法院司法管轄權的管轄並不會影響其他任何一方於任何司法範圍提起訴訟的權利；而於任何司法範圍提起訴訟亦不表示其他任何一方不能於其他任何司法範圍提起訴訟。
            </p>

            <p className="mt-8 text-sm text-gray-600">
              當你表示同意及遵守這份合約，這代表你能夠理解這份合約的內容及有正常的判斷力去作出決定。若果你不同意本公司之守則，請不要登記使用該項服務。本站有權停止提供服務給任何會員。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 