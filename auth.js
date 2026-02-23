async function getAuthPassword() {
    // 1. セッションに保存されているか確認
    let pass = sessionStorage.getItem('user_password');

    // 2. なければ入力を求める
    if (!pass) {
        pass = prompt("パスワードを入力してください");
        if (pass) {
            sessionStorage.setItem('user_password', pass);
        }
    }
    return pass;
}

// ページ読み込み時に実行
(async () => {
    const pass = await getAuthPassword();
    if (!pass) {
        alert("パスワードが必要です");
        location.reload();
    }
})();