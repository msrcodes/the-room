import { NextApiRequest, NextApiResponse } from 'next'
import {
	ClientToServerEvents,
	InterServerEvents,
	ServerToClientEvents,
	SocketData,
} from '../../utils/socket'
import { Server as NetServer, Socket } from 'net'
import { Server as SocketIOServer } from 'socket.io'
import { env } from '../../env/client.mjs'

class TheRoomSocketServer extends SocketIOServer<
	ClientToServerEvents,
	ServerToClientEvents,
	InterServerEvents,
	SocketData
> {}

type NextApiResponseServerIO = NextApiResponse & {
	socket: Socket & {
		server: NetServer & {
			io?: TheRoomSocketServer
		}
	}
}

export const config = {
	api: {
		bodyParser: false,
	},
}

export default function SocketHandler(
	req: NextApiRequest,
	res: NextApiResponseServerIO
) {
	if (!res.socket.server.io) {
		// adapt Next's net Server to http Server
		const httpServer: NetServer = res.socket.server
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const io = new TheRoomSocketServer(httpServer as any, {
			path: env.NEXT_PUBLIC_SOCKET_PATH,
		})

		io.on('connection', (socket) => {
			socket.on('hello', () => {
				console.log('hi there!')
			})
		})

		// append SocketIO server to Next.js socket server response
		res.socket.server.io = io
	}
	res.end()
}
