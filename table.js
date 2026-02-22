const API_KEY = 'AIzaSyDKCLnMuf79ncOrfS6i8q2aALaolon0oOk';
const SPREAD_SHEET_ID = '1kF65q3nayO6Dhbpsg4AeI3OiWZ8hqQwqcBII6v35wtc';
const RANGE = 'シート1!A1:ZZ'; 

const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREAD_SHEET_ID}/values/${RANGE}?key=${API_KEY}`;

async function loadTable() {
    try {
        const response = await fetch(url);
        const result = await response.json();
        const data = result.values;

        if (!data) {
            console.error("データが見つかりません。");
            return;
        }

        const header = data[0]; 
        const rows = data.slice(1);

        // ヘッダー生成
        const headRow = document.getElementById('tableHead');
        header.forEach(h => {
            const th = document.createElement('th');
            th.textContent = h;
            headRow.appendChild(th);
        });

        // 中身生成
        const tbody = document.getElementById('tableBody');
        tbody.innerHTML = "";
        rows.forEach(row => {
            // 【修正ポイント】行のすべてのセルを合体させて、中身が空（""）じゃないかチェック
            // これにより、データが入っていない行を完全にスキップします
            const rowText = row.join("").trim();
            if (rowText === "") return; 

            const tr = document.createElement('tr');
            row.forEach(cell => {
                const td = document.createElement('td');
                td.textContent = cell || ""; 
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });

        // DataTablesの有効化（jQueryを使用）
        $('#attendanceTable').DataTable({
            paging: false,
            searching: true,
            scrollX: false,
            info: false,
            scrollCollapse: true,
            autoWidth: false,
            order: [[header.length - 1, 'desc']],
            language: {
                search: "名前で絞り込み:"
            },
            // ★ここから追加：表の準備ができた瞬間に実行される命令
            initComplete: function() {
                // 「dataTables_scrollSpanning」や「空のtr」を強制的に排除する
                $('.dataTables_scrollBody thead tr').css({visibility:'collapse', height:0});
                // 万が一中身が空のtdがあったらその親のtrを消す
                $('#attendanceTable tbody tr').each(function() {
                    if ($(this).text().trim() === "") {
                        $(this).remove();
                    }
                });
            }
        });

    } catch (error) {
        console.error("読み込みエラー:", error);
    }
}

// ページが読み込まれたら実行
window.onload = loadTable;