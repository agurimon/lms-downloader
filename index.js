window.addEventListener('load', async function () {

    const { title, link } = await get_title_link();
    console.log(title, link);

    if (title && link) {
        const iframe = document.querySelector('#tool_content');
        const header = iframe.contentWindow.document.querySelector('.xnlail-video-component-header');

        const container = document.createElement('div')
        container.className = "container2";

        const download_btn = make_btn('동영상 다운로드', 'download_btn');
        download_btn.addEventListener('click', () => onDownloadClick(title, link));
        container.append(download_btn);

        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = chrome.runtime.getURL('index.css');
        container.appendChild(cssLink);

        container.append(make_loading());
        header.append(container);

        const textarea = document.createElement('textarea');
        textarea.style = "width: 100%;"

        header.append(textarea);
    }
});

function curl_template(url, title, i) {
    return `curl --output '${title}_${i}.mp4' --location '${url}' --header 'Range: bytes=0-' --header 'Referer: https://commons.ssu.ac.kr/'\n`;
}

function onDownloadClick(title, id) {
    console.log('Sending message:', { id, title });
    const iframe = document.querySelector('#tool_content');
    iframe.contentWindow.document.querySelector('.spinner').style.display = 'flex';
    
    chrome.runtime.sendMessage(
        {
            message: "sendMessage",
            payload: {
                id,
                title
            }
        },
        (response) => {
            const iframe = document.querySelector('#tool_content');

            if (response.status === 'success')  {
                console.log('response: success');
                
                const textarea = iframe.contentWindow.document.querySelector('textarea')
                
                const urls = response.message['urls'];
                const title = response.message['title'];
                console.log('urls', urls);
                let i = 0;
                urls.forEach(url => {
                    console.log(url);
                    textarea.value += curl_template(url, title, i);
                    i += 1;
                });

            }
            else {
                console.error(response.message);
                alert(response.message);
            }

            iframe.contentWindow.document.querySelector('.spinner').style.display = 'none';
        }
    );
}

function make_loading() {
    const div_spinner = document.createElement('div')
    div_spinner.className = "spinner"
    const div_circle = document.createElement('div')
    div_circle.className = "circle"
    div_spinner.append(div_circle)

    return div_spinner;
}

function make_btn(text, id) {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.id = id;

    btn.style.backgroundColor = '#007aff';
    btn.style.border = 'none';
    btn.style.borderRadius = '8px';
    btn.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    btn.style.color = 'white';
    btn.style.cursor = 'pointer';
    btn.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"';
    btn.style.fontSize = '14px';
    btn.style.fontWeight = '500';
    btn.style.letterSpacing = '0.5px';
    btn.style.margin = '10px';
    btn.style.padding = '8px 16px';
    btn.style.textAlign = 'center';
    btn.style.textDecoration = 'none';
    btn.style.textTransform = 'none';
    btn.style.transition = 'background-color 0.2s ease, box-shadow 0.2s ease';

    btn.addEventListener('mouseover', () => {
        btn.style.backgroundColor = '#0059d6';
        btn.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.15)';
    });
    btn.addEventListener('mouseout', () => {
        btn.style.backgroundColor = '#007aff';
        btn.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    });

    btn.addEventListener('mousedown', () => {
        btn.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
    });
    btn.addEventListener('mouseup', () => {
        btn.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    });

    return btn;
}

function get_title_link() {
    return new Promise((resolve) => {
        const interval = setInterval(function () {
            let title = document.querySelector('#tool_content').contentWindow.document.querySelector('.xnlailct-title').textContent;
            let link = new URL(document.querySelector('#tool_content').contentWindow.document.querySelector('.xnlailvc-commons-frame').src).pathname.split('/')[2];
            
            if (title && link) {
                clearInterval(interval);
                resolve({title, link});
            }
        }, 1000);
    });
}