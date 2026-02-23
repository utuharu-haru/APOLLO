// 1. GASのウェブアプリURL（デプロイして取得したもの）
const GAS_URL = "https://script.google.com/macros/s/AKfycbxWgoesW2bX8IXAseNpK0p-3Nd_12u34lxJXhp5033d4uVxyO0o9vnCNp3p_kLnKaWgvA/exec";

async function loadTableData() {
    // 2. auth.jsで保存したパスワードを取得
    const pass = sessionStorage.getItem('user_password');

    if (!pass) {
        alert("認証が必要です。");
        location.href = "index.html"; // パスワード入力画面へ戻す
        return;
    }

    try {
        // 3. GASに「パスワード」をパラメータとして付けてリクエスト
        // fetchのURL末尾に ?pass=... を追加します
        const response = await fetch(`${GAS_URL}?pass=${encodeURIComponent(pass)}`);
        const data = await response.json();

        // 4. GAS側で認証エラーが返ってきた場合
        if (data.error) {
            alert("認証エラー: パスワードが正しくないか、セッションが切れました。");
            sessionStorage.removeItem('user_password');
            location.href = "index.html";
            return;
        }

        document.getElementById('loading').style.display = 'none';    // 読み込み中を隠す
        document.getElementById('tableContent').style.display = 'block'; // 表を表示する

        // 5. 成功したら表を作成する関数を呼ぶ
        // GASから [ [A1, B1], [A2, B2] ] の形式で届くことを想定
        createTable(data);

    } catch (error) {
        console.error("データ取得失敗:", error);
        alert("データの読み込みに失敗しました。");
    }
}

// HTMLの表（table）を生成する関数
function createTable(rows) {
    const tableHead = document.getElementById('tableHead');
    const tableBody = document.getElementById('tableBody');

    // 1. ヘッダーの作成
    if (tableHead && rows.length > 0) {
        tableHead.innerHTML = "";
        rows[0].forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            tableHead.appendChild(th);
        });
    }

    // 2. ボディの作成
    if (!tableBody) return;
    tableBody.innerHTML = ""; 

    rows.forEach((row, index) => {
        if (index === 0) return;
        const tr = document.createElement('tr');
        row.forEach(cell => {
            const td = document.createElement('td');
            td.textContent = cell;
            tr.appendChild(td);
        });
        tableBody.appendChild(tr);
    });

    // --- ここからが重要！ DataTablesの有効化 ---
    
    // すでにDataTablesが動いている場合は、一度破棄してから再設定する
    if ($.fn.DataTable.isDataTable('#attendanceTable')) {
        $('#attendanceTable').DataTable().destroy();
    }

    const lastColumnIndex = rows[0].length - 1;

    $('#attendanceTable').DataTable({
        "order": [[ lastColumnIndex, "desc" ]], 
        "paging": false,
        "searching": true,
        "info": false,
        "scrollX": false,
        "autoWidth": false,
        "deferRender": true,
        "language": {
            "search": "名前を検索:",
            "zeroRecords": "一致するデータが見つかりません"
        }
    });
}

// ページ読み込み時に実行
window.onload = loadTableData;