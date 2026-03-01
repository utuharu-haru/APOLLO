const GAS_URL = "https://script.google.com/macros/s/AKfycbxs6qRxshTbOzju7Qc4AVkto6LV-hcj86pJt1G9YlNDFR06TY76eHdApDT2BaUPNAARLg/exec";

async function loadSchedule() {
    const pass = sessionStorage.getItem('user_password');
    if (!pass) return;

    try {
        const response = await fetch(`${GAS_URL}?pass=${encodeURIComponent(pass)}&mode=calendar`);
        const events = await response.json();

        const listElement = document.getElementById('event-list');
        const loadingElement = document.getElementById('loading-schedule');
        if (loadingElement) loadingElement.style.display = 'none';

        if (!events || events.length === 0 || events.error) {
            listElement.innerHTML = `<li>${events.error || '予定はありません'}</li>`;
            return;
        }

        // --- 1. カレンダー（FullCalendar）の表示処理 ---
        const calendarEvents = events.map(event => {
            const year = new Date().getFullYear();
            const [month, day] = event.monthDay.split('/');
            return {
                title: event.title,
                start: `${year}-${month}-${day}`, // YYYY-MM-DD形式
                backgroundColor: event.color,
                borderColor: 'transparent',
                textColor: '#333'
            };
        });

        const calendarEl = document.getElementById('calendar-view');
        if (calendarEl) {
            const calendar = new FullCalendar.Calendar(calendarEl, {
                initialView: 'dayGridMonth',
                locale: 'ja',
                height: 'auto',
                displayEventTime: false,
                eventDisplay: 'block',
                dayMaxEvents: false,    // 「+他2件」にせず、すべて表示する
                eventContent: function(arg) {
                    // 文字を折り返し、サイズを調整するスタイルを直接指定
                    let italicEl = document.createElement('div');
                    italicEl.style.cssText = "white-space: normal; word-wrap: break-word; font-size: 0.75rem; line-height: 1.1; padding: 1px;";
                    italicEl.innerHTML = arg.event.title;
                    let arrayOfDomNodes = [ italicEl ];
                    return { domNodes: arrayOfDomNodes };
                },
                headerToolbar: { left: 'prev', center: 'title', right: 'next' }
            });
            calendar.addEventSource(calendarEvents);
            calendar.render();
        }

        // --- 2. 下部のリスト表示処理 ---
        events.forEach(event => {
            const li = document.createElement('li');
            li.style.cssText = `list-style:none; display:flex; background:${event.color}; margin-bottom:15px; border-radius:12px; box-shadow:0 4px 8px rgba(0,0,0,0.1); overflow:hidden; color:#333;`;

            // リンク化処理
            let formattedDescription = event.description;
            if (formattedDescription) {
                const urlPattern = /(https?:\/\/[\w\/:%#\$&\?\(\)~\.=\+\-]+)/g;
                formattedDescription = formattedDescription.replace(urlPattern, '<a href="$1" target="_blank" style="color:#0044CC; text-decoration:underline;">$1</a>');
            }

            const descriptionHtml = formattedDescription 
                ? `<div style="font-size:0.85rem; margin-top:8px; padding-top:8px; border-top:1px solid rgba(0,0,0,0.1); white-space:pre-wrap;">${formattedDescription}</div>` 
                : '';

            li.innerHTML = `
                <div style="background:rgba(255,255,255,0.3); padding:10px; min-width:70px; text-align:center; display:flex; flex-direction:column; justify-content:center; border-right:1px solid rgba(0,0,0,0.05);">
                    <div style="font-size:0.8rem; font-weight:bold;">${event.monthDay.split('/')[0]}月</div>
                    <div style="font-size:1.4rem; font-weight:900; line-height:1;">${event.monthDay.split('/')[1]}</div>
                    <div style="font-size:1rem; font-weight:bold;">(${event.weekDay})</div>
                </div>
                <div style="padding:12px; flex-grow:1;">
                    <div style="font-weight:bold; font-size:1.1rem; margin-bottom:3px;">${event.title}</div>
                    <div style="font-size:0.85rem; font-weight:bold;">⏰ ${event.time} 〜</div>
                    ${event.location ? `<div style="font-size:0.85rem; opacity:0.8;">📍 ${event.location}</div>` : ''}
                    ${descriptionHtml}
                </div>
            `;
            listElement.appendChild(li);
        });

    } catch (e) {
        console.error(e);
        if (document.getElementById('loading-schedule')) {
            document.getElementById('loading-schedule').innerText = "エラーが発生しました。";
        }
    }
}

window.onload = loadSchedule;