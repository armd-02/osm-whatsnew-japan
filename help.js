(() => {
  const trigger = document.querySelector('#map-guide-open');
  if (!trigger) return;

  const STORAGE_KEY = 'osm-whatsnew-guide-v1';
  const dialog = window.OSMModal.createDialog({
    className: 'app-modal',
    labelledBy: 'map-guide-title',
    describedBy: 'map-guide-intro',
    content: `
      <div class="app-modal-heading app-modal-guide-heading"><div class="map-guide-title"><img src="image/site.png" width="480" height="480" alt=""><h2 id="map-guide-title">OSM What’s New Japanについて</h2></div></div>
      <div class="app-modal-body">
        <p id="map-guide-intro" class="map-guide-intro">自分の街の最近の変化を見つけ、次に調べたい場所を探してみませんか。OpenStreetMapに追加・修正された日本国内の場所や施設を見られます。</p>
        <ul class="map-guide-list"><li><img class="map-guide-image" src="image/map.png" width="1254" height="1254" alt=""><span><strong>地図</strong>追加（緑）・修正（オレンジ）された場所などを、時刻に沿って表示</span></li><li><img class="map-guide-image" src="image/report.png" width="1254" height="1254" alt=""><span><strong>分析</strong>地域・代表タグの比較、日別・累積件数、マッパーの活動状況を集計</span></li><li><span class="map-guide-symbol" aria-hidden="true">▦</span><span><strong>更新密度</strong>最近の更新が集中している地域を約1km四方で比較</span></li><li><span class="map-guide-symbol" aria-hidden="true">♙</span><span><strong>マッパー</strong>地図を編集する人の、直近1年間の活動地域や追加・修正の記録を表示</span></li></ul>
        <section class="map-guide-participate"><h3>自分でも地図を編集できます</h3><p>気になる場所は、自分でも追加・修正できます。まずは身近なお店や施設を、実際の地図や現地と比べてみましょう。</p><a href="https://learnosm.org/ja/beginner/" target="_blank" rel="noopener noreferrer">地図の編集を始めるには（LearnOSM 日本語ガイド）<span class="visually-hidden">（新しいタブで開く）</span></a></section>
        <details class="disclosure-panel"><summary>用語の見方</summary><p>「地物」は地図上のお店・施設・道路などの要素、「代表タグ」はその場所の種類を表す情報です。「マッパー」は地図を編集する人を指します。</p></details>
        <p class="map-guide-scope">タグ付きノードに加え、対象タグを持つwayとmultipolygon relationを対象としています。</p><p class="map-guide-note"><strong>時刻について</strong>OSMへの登録・更新時刻を示すもので、施設の開業日や現実世界での変更日を示すものではありません。</p>
        <section class="map-guide-data-use" aria-labelledby="map-guide-data-use-title"><h3 id="map-guide-data-use-title">公開編集情報の取り扱い</h3><p>OSM What’s New Japanは、OpenStreetMapで公開されている編集情報を取得し、日本国内の地図更新状況を可視化・集計しています。</p><p>取得・表示する情報にはOpenStreetMapのユーザー名、ユーザーID、編集日時、変更セット、編集対象地物およびその位置等が含まれる場合があります。</p><p>これらの情報は、OpenStreetMapの更新状況の可視化・統計分析、およびマッパーごとの活動状況を表示する目的で利用します。</p><p>マッパープロフィールのレベル・バッジ・活動地域・カテゴリ等は、収集対象となった公開編集情報から自動的に算出されます。これらはマッパーの能力、信頼性またはOpenStreetMapにおける全活動を評価するものではありません。</p></section>
        <section class="map-guide-about" aria-label="運営情報、ソースコードとライセンス"><p class="map-guide-about-description">このWebフロントエンドのソースコードをGitHubで公開しています。</p><a class="site-info-repository map-guide-repository" href="https://github.com/armd-02/osm-whatsnew-japan" target="_blank" rel="noopener noreferrer"><span>GitHubでソースコードを見る</span><small>armd-02/osm-whatsnew-japan ↗</small></a><p class="map-guide-license">OpenStreetMapのデータはOpen Database License（ODbL）の下で提供されています。利用時は© OpenStreetMap contributorsの表示が必要です。</p><p class="map-guide-operator"><a href="https://www.openacrossbase.net/" target="_blank" rel="noopener noreferrer">制作・運営：Open Across Base<span class="visually-hidden">（運営サイトを新しいタブで開く）</span></a><br>プロフィール集計からの除外を希望する場合はご連絡ください。</p><p class="map-guide-disclaimer">OpenStreetMap FoundationおよびOpenStreetMap Foundation Japanの公式サービスではありません。</p></section>
      </div>
      <div class="app-modal-footer"><button class="map-guide-start" type="button">閉じる</button></div>`,
  });

  let openMode = '';

  function hasSeen() {
    try {
      return window.localStorage.getItem(STORAGE_KEY) !== null;
    } catch {
      return false;
    }
  }

  function rememberSeen() {
    try {
      window.localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // Storage may be unavailable in private or restricted browsing contexts.
    }
  }

  const modal = new window.OSMModal(dialog, {
    beforeOpen() {
      dialog.dispatchEvent(new CustomEvent('osm-guide-before-open', {detail: {mode: openMode}}));
    },
    afterClose() {
      const closedMode = openMode;
      openMode = '';
      if (closedMode === 'automatic') rememberSeen();
      dialog.dispatchEvent(new CustomEvent('osm-guide-closed', {detail: {mode: closedMode}}));
    },
  });

  function open({mode = 'manual', focusTarget = trigger} = {}) {
    if (dialog.open) return;
    openMode = mode;
    modal.open({
      returnFocus: focusTarget || trigger,
      focusTarget: modal.closeButton,
    });
  }

  function close() {
    modal.close();
  }

  trigger.addEventListener('click', () => open());
  modal.bindClose('.map-guide-start');

  window.osmWhatsNewGuide = {dialog, hasSeen, open, close};
})();
