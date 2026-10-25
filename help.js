(() => {
  const menuToggle = document.querySelector('.header-menu-toggle');
  const viewTabs = document.querySelector('.header-view-tabs');
  const mobileMenu = window.matchMedia('(max-width: 700px)');

  function closeMenu({restoreFocus = false} = {}) {
    if (!menuToggle || !viewTabs) return;
    viewTabs.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', '画面メニューを開く');
    if (restoreFocus) menuToggle.focus();
  }

  if (menuToggle && viewTabs) {
    menuToggle.addEventListener('click', () => {
      const open = menuToggle.getAttribute('aria-expanded') !== 'true';
      viewTabs.classList.toggle('is-open', open);
      menuToggle.setAttribute('aria-expanded', String(open));
      menuToggle.setAttribute('aria-label', open ? '画面メニューを閉じる' : '画面メニューを開く');
    });
    viewTabs.addEventListener('click', event => {
      if (event.target.closest('a')) closeMenu();
    });
    document.addEventListener('click', event => {
      if (!event.target.closest('header')) closeMenu();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && viewTabs.classList.contains('is-open')) {
        closeMenu({restoreFocus: true});
      }
    });
    mobileMenu.addEventListener('change', closeMenu);
  }

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
        <p id="map-guide-intro" class="map-guide-intro">OpenStreetMapで日本国内に追加・編集された地物を、地図・分析・密度の画面とマッパー別プロフィールで確認できるWebアプリケーションです。</p>
        <ul class="map-guide-list"><li><img class="map-guide-image" src="image/map.png" width="1254" height="1254" alt=""><span><strong>地図</strong>新規作成（緑）・更新（オレンジ）の地物を表示し、時刻に沿って再生</span></li><li><img class="map-guide-image" src="image/report.png" width="1254" height="1254" alt=""><span><strong>分析</strong>地域・代表タグの比較、日別・累積件数、マッパーの活動状況を集計</span></li><li><span class="map-guide-symbol" aria-hidden="true">▦</span><span><strong>密度</strong>選択期間に更新された地物を約1kmメッシュ単位で表示</span></li><li><span class="map-guide-symbol" aria-hidden="true">♙</span><span><strong>マッパー</strong>直近1年間の活動、継続レベル、獲得バッジをマッパー別に表示</span></li></ul>
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
