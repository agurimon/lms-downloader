chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Received message:', request);
    if (request.message === 'sendMessage') {
        const id = request.payload.id;
        const title = request.payload.title;

        download(id, title)
            .then((message) => {
                sendResponse({ status: 'success', message: message });
            })
            .catch((error) => {
                sendResponse({ status: 'error', message: 'Download failed!' });
            });

        return true;
    }
});

async function fetchResource(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    return response;
}

async function getfilename(contentId) {
    const xmlUrl = `https://commons.ssu.ac.kr/viewer/ssplayer/uniplayer_support/content.php?content_id=${contentId}`;

    try {
        const data = await (await fetchResource(xmlUrl)).text();
        const xmlDoc = new DOMParser().parseFromString(data, 'application/xml');
        const content_type = xmlDoc.querySelector('content_type').textContent;

        if (content_type === "upf") {
            let media_uri = xmlDoc.querySelector('media_uri').textContent;
            const _filenames = xmlDoc.querySelectorAll('main_media');
            
            let urls = [];
            _filenames.forEach(filename => {
                urls.push(media_uri.replace("[MEDIA_FILE]", filename.textContent));
            });

            return urls;
        } else {
            const media_uri = xmlDoc.querySelector('media_uri').textContent;
            return media_uri
        }

    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

async function download(contentId, title) {
    const urls = await getfilename(contentId);
    
    // try {
    //     const proxyLink = 'http://localhost:3000/proxy?url=';
    //     const response = await fetchResource(proxyLink + urls[0]);
    //     const contentLength = parseInt(response.headers.get('Content-Length'), 10);
    //     const reader = response.body.getReader();

    //     const stream = new ReadableStream({
    //         async start(controller) {
    //             while (true) {
    //                 const { done, value } = await reader.read();
    //                 if (done) {
    //                     controller.close();
    //                     break;
    //                 }
    //                 controller.enqueue(value);
    //             }
    //         }
    //     });

    //     const buffer = await (await new Response(stream)).arrayBuffer();
    //     saveAsFile(buffer, `${title}.mp4`);
    // } catch (error) {
    //     throw new Error('Error fetching data:', error);
    // }
    return {'urls': urls, 'title': title};
}

function saveAsFile(buffer, fileName) {
    const blob = new Blob([buffer], { type: 'video/mp4' });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    link.click();
}
