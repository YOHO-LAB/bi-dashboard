const resolveBlobData = blobData => {
  return new Promise((resolve, reject) => {
    if (blobData.type === 'application/msexcel') {
      resolve(blobData);
    } else if (blobData.type === 'application/json') {
      const fr = new FileReader();

      fr.onload = function() {
        const rs = JSON.parse(this.result);

        reject(rs);
      };
      fr.readAsText(blobData);
    } else {
      reject();
    }
  });
};
const downloadBlob = (blob, name) => {
  const URL = window.URL || window.webkitURL;
  const blobUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  if ('download' in anchor) {
    anchor.style.visibility = 'hidden';
    anchor.href = blobUrl;
    anchor.download = name;
    document.body.appendChild(anchor);
    let evt = document.createEvent('MouseEvents');

    evt.initEvent('click', true, true);
    anchor.dispatchEvent(evt);
    document.body.removeChild(anchor);
  } else if (navigator.msSaveBlob) {
    navigator.msSaveBlob(blob, name);
  } else {
    location.href = blobUrl;
  }
};
const dataURL2Blob = dataUrl => {
  let arr = dataUrl.split(',');
  let mime = arr[0].match(/:(.*?);/)[1];
  let dataStr = atob(arr[1]);
  let n = dataStr.length, u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = dataStr.charCodeAt(n);
  }
  return new Blob([u8arr], {type: mime });
};

export default {
  resolveBlobData,
  downloadBlob,
  dataURL2Blob
};
