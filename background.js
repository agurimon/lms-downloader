var xml2js = require('xml2js');

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
    console.log(xmlUrl)
    try {
        const data = await (await fetchResource(xmlUrl)).text();
        var parser = new xml2js.Parser();
        const result = await parser.parseStringPromise(data);

        console.log(result.content.content_playing_info[0].content_type)
        if (result.content.content_playing_info[0].content_type[0] === "upf") {
          const stories = result.content.content_playing_info[0].story_list[0].story;
          const media_ids = stories.map(story => story.main_media_list[0].main_media[0]._);
          const media_uri = result.content.service_root[0].media[0].media_uri[0]._;
  
          let urls = [];
          media_ids.forEach(media_id => {
              urls.push(media_uri.replace("[MEDIA_FILE]", media_id));
          });
  
          return urls;
        } else {
          return result.content.content_playing_info[0].main_media[0].desktop[0].html5[0].media_uri[0];
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

async function download(contentId, title) {
    const urls = await getfilename(contentId);
    
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
