// auth.js

// 「pass」をSHA-256でハッシュ化した値
const SECRET_HASH = "7b1677b3a5ebfd12c9f9adbd4d512f00fa6bb964d9850e384312b1d713635e54";

(async function() {
    // すでにこのセッションで認証済みかチェック
    if (sessionStorage.getItem('is_authenticated') === 'true') {
        return; // 認証済みなら何もしない
    }

    // 認証されていない場合、パスワード入力を求める
    while (true) {
        const input = prompt("パスワードを入力してください");
        
        if (input === null) {
            // キャンセルされたらトップへ飛ばすなどの処理
            location.href = "index.html";
            break;
        }

        // 入力値をハッシュ化して比較
        const hash = await sha256(input);
        
        if (hash === SECRET_HASH) {
            // 認証成功：セッションに保存（ブラウザを閉じるまで有効）
            sessionStorage.setItem('is_authenticated', 'true');
            break;
        } else {
            alert("パスワードが正しくありません。");
        }
    }
})();

// SHA-256ハッシュ計算関数
async function sha256(text) {
    const msgUint8 = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}