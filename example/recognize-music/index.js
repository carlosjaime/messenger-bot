'use strict'
const http = require('http')
const Bot = require('../../')
const recognizeSong = require('./recognize')

// Edit these with your tokens
const FB_TOKEN = 'EAAPLOZBfYJ24BAK8jttZAtd5yjbvZBPYSd3Yiqw31gE5ZB7xV9vGOEmod6US7ZCcbDLHFHe76J2VK7wknis5G8DvtuGG3mXNtG2K1BdxW8MeyRwNDRhMq3UEwDpzDQVPVWbHwMSoTD6J9rVhECZAq0VZBSRRxgsjUf9vlfLdrBkwgZDZD'
const FB_VERIFY = 'SONG-CANCION'
const ACR_ACCESS_KEY = '7db0989be6d8254c255bf246e5a14fd1'
const ACR_ACCESS_SECRET = 'OXaJmtuNRm62WMrVLzXigCAGzvZCkmolj4OPKrAv'
const ACR_HOST = 'identify-ap-southeast-1.acrcloud.com'

let bot = new Bot({
  token: FB_TOKEN,
  verify: FB_VERIFY
})

bot.on('error', (err) => {
  console.log(err.message)
})

bot.on('message', (payload, reply) => {
  console.log('Received message from ' + payload.sender.id)
  if (!payload.message.attachments || !payload.message.attachments[0] || payload.message.attachments[0].type !== 'audio') {
    return reply({
      text: 'That\'s not an audio message. Send me an audio message by pressing the mic button at the bottom of the app.'
    })
  }

  reply({ text: 'Identifying song... this might take a few seconds.' })
  recognizeSong({
    message: payload.message,
    key: ACR_ACCESS_KEY,
    secret: ACR_ACCESS_SECRET,
    host: ACR_HOST
  }, (err, song) => {
    if (err && err.message === 'NO_MATCH') {
      return reply({
        text: 'I couldn\'t identify this song.'
      })
    }
    if (err) throw err

    let element = {
      title: song.title,
      subtitle: song.artist,
      image_url: song.album_art || null,
      buttons: []
    }

    if (song.spotify) {
      element.buttons.push({
        type: 'web_url',
        title: 'Listen on Spotify',
        url: song.spotify
      })
    } else {
      element.buttons.push({
        type: 'web_url',
        title: 'Search for song',
        url: `https://google.com/search?q=${song.artist} ${song.title}`
      })
    }

    if (song.youtube) {
      element.buttons.push({
        type: 'web_url',
        title: 'Watch music video',
        url: song.youtube
      })
    }

    reply({
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements: [element]
        }
      }
    })
  })
})

http.createServer(bot.middleware()).listen(3000, () => console.log('Server running on http://localhost:3000'))
