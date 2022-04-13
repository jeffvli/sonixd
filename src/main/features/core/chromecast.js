import { Client, DefaultMediaReceiver } from 'castv2-client';
import { ipcMain } from 'electron';
import mdns from 'mdns-js';

const browser = mdns.createBrowser(mdns.tcp('googlecast'));
const client = new Client();

ipcMain.on('chromecast', (_event, arg) => {
  const { device, queue } = arg;
  client.volume = 0.2;
  client.stepInterval = 0.5;
  client.muted = false;

  client.connect(device, () => {
    console.log('connected, launching app ...');

    client.launch(DefaultMediaReceiver, (err, player) => {
      player.on('status', (status) => {
        console.log('status broadcast playerState=%s', status.playerState);
      });

      // console.log(
      //   'app "%s" launched, loading media %s ...',
      //   player.session.displayName,
      //   media.contentId
      // );

      // player.load(media, { autoplay: true }, (loadErr, status) => {
      //   console.log('media loaded playerState=%s', status.playerState);
      // });

      player.queueLoad(queue, { autoplay: true, startIndex: 1, repeatMode: 'REPEAT_OFF' });
    });
  });

  client.on('error', (err) => {
    console.log('Error: %s', err.message);
    client.close();
  });
});

ipcMain.on('chromecast-play', () => {
  client.launch(DefaultMediaReceiver, (err, player) => {
    player.next();
  });
});

ipcMain.on('chromecast-stop', () => {});

ipcMain.on('chromecast-seek', () => {
  client.launch(DefaultMediaReceiver, (err, player) => {
    const media = {
      contentId: '',

      metadata: {},
    };

    player.on('status', (status) => {
      console.log('status broadcast playerState=%s', status.playerState);
    });

    console.log(
      'app "%s" launched, loading media %s ...',
      player.session.displayName,
      media.contentId
    );

    player.load(media, { autoplay: true }, (loadErr, status) => {
      console.log('media loaded playerState=%s', status.playerState);
    });
  });
});

// ipcRenderer.on('chromecast', () => {
//   browser.on('ready', browser.discover);

//   browser.on('update', (service) => {
//     console.log('service', service);
//     if (service.addresses && service.fullname) {
//       console.log('service.addresses[0]', service.addresses[0]);
//     }
//   });
// });

// browser.on('serviceUp', (service) => {
//   console.log('found device "%s" at %s:%d', service.name, service.addresses[0], service.port);
//   ondeviceup(service.addresses[0]);
//   browser.stop();
// });

browser.on('ready', browser.discover);

browser.on('update', (service) => {
  console.log('service', service);
  if (service.addresses && service.fullname) {
    console.log('service.addresses[0]', service.addresses[0]);
    // this.ondeviceup(
    //   service.addresses[0],
    //   service.fullname.substring(0, service.fullname.indexOf('._googlecast'))
    // );
  }
});
