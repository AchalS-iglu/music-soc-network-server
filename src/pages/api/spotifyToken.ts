import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

const API_URL = 'https://accounts.spotify.com/api/token';

type Data = {
    access_token: string;
    token_type: string;
    expires_in: number;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            if (!req.query.code) {
                res.status(400).send('Missing code');
                return;
            } else if (!req.query.redirectUri) {
                res.status(400).send('Missing redirectUri');
                return;
            }
            const client_id = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID as string;
            const client_secret = process.env.SPOTIFY_CLIENT_SECRET as string;
            const authHeader = 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64');
            const body = new URLSearchParams({
                grant_type: 'authorization_code',
                code: req.query.code as string,
                redirect_uri: req.query.redirectUri as string,
            })
            const spres = await axios.post<Data>(API_URL, body, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': authHeader,
                },
            });
            res.status(200).json(spres.data);
        } catch (error) {
            res.status(500).send('Error getting access token');
        }
    } else {
        res.status(405).send('Method not allowed');
    }
}