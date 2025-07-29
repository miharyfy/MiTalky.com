const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const app = express();

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const D_ID_API_KEY = process.env.D_ID_API_KEY;

app.use(bodyParser.json());

app.get("/", (req, res) => res.send("Messenger IA Bot Miasa ✅"));

app.get("/webhook", (req, res) => {
    let VERIFY_TOKEN = "123456";
    let mode = req.query["hub.mode"];
    let token = req.query["hub.verify_token"];
    let challenge = req.query["hub.challenge"];
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
        console.log("WEBHOOK VERIFIED");
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
});

app.post("/webhook", async (req, res) => {
    const body = req.body;
    if (body.object === "page") {
        for (let entry of body.entry) {
            let webhook_event = entry.messaging[0];
            let sender_psid = webhook_event.sender.id;

            if (webhook_event.message) {
                if (webhook_event.message.quick_reply) {
                    let payload = webhook_event.message.quick_reply.payload;
                    if (payload === "INFO") {
                        await sendText(sender_psid, "ℹ️ Ity bot ity dia mampiasa IA hahafahanao mamadika sary ho vidéo mihetsika. Alefaso fotsiny ny sary dia hihetsika ilay tarehy!");
                        await sendGreetingWithButtons(sender_psid);
                    }
                } else if (webhook_event.message.attachments) {
                    let imageUrl = webhook_event.message.attachments[0].payload.url;
                    let video_url = await animateWithDID(imageUrl);
                    await sendVideo(sender_psid, video_url);
                    await sendGreetingWithButtons(sender_psid);
                } else {
                    await sendText(sender_psid, "Alefaso sary iray na safidio eto ambany:");
                    await sendGreetingWithButtons(sender_psid);
                }
            }
        }
        res.sendStatus(200);
    }
});

async function sendText(psid, message) {
    await axios.post(`https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
        recipient: { id: psid },
        message: { text: message }
    });
}

async function sendVideo(psid, videoUrl) {
    await axios.post(`https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
        recipient: { id: psid },
        message: {
            attachment: {
                type: "video",
                payload: { url: videoUrl }
            }
        }
    });
}

async function sendGreetingWithButtons(psid) {
    await axios.post(`https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
        recipient: { id: psid },
        message: {
            text: "Salama 🤖! Inona no tianao hatao?",
            quick_replies: [
                {
                    content_type: "text",
                    title: "📷 Alefa sary",
                    payload: "SEND_PHOTO"
                },
                {
                    content_type: "text",
                    title: "ℹ️ Fanazavana IA",
                    payload: "INFO"
                }
            ]
        }
    });
}

async function animateWithDID(imageUrl) {
    const response = await axios.post("https://api.d-id.com/talks", {
        script: {
            type: "text",
            input: "Bonjour ! Je suis animé par IA.",
            provider: { type: "microsoft", voice_id: "fr-FR-DeniseNeural" }
        },
        source_url: imageUrl
    }, {
        headers: {
            "Authorization": `Bearer ${D_ID_API_KEY}`,
            "Content-Type": "application/json"
        }
    });

    const id = response.data.id;
    let result;
    while (true) {
        result = await axios.get(`https://api.d-id.com/talks/${id}`, {
            headers: { Authorization: `Bearer ${D_ID_API_KEY}` }
        });
        if (result.data.result_url) break;
        await new Promise(r => setTimeout(r, 2000));
    }
    return result.data.result_url;
}

app.listen(3000, () => console.log("Bot mandeha amin'ny : http://localhost:3000"));
