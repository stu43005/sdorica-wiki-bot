import dns2, { Packet } from "dns2";
import { Logger } from "./logger";

const domains = [
	"origin-sdorica.rayark.download",
	"sdorica.rayark.download",
];
const ip = "192.168.3.65";

const logger = new Logger('dns-server');

export function createDnsProxy() {
	const dns = new dns2();
	const server = dns2.createServer({
		udp: true,
		handle: async (request, send, rinfo) => {
			const [ question ] = request.questions;
			const { name } = question;

			if (domains.includes(name)) {
				const response = Packet.createResponseFromRequest(request);
				response.answers.push({
					name,
					type: Packet.TYPE.A,
					class: Packet.CLASS.IN,
					ttl: 300,
					address: ip,
				});
				send(response);
			}
			else {
				const result = await dns.resolveA(name);
				send(result);
			}
		},
	});

	server.on('request', (request, response, rinfo) => {
		const name: string = request.questions[0].name;
		if (["rayark", "sdorica"].some(k => name.includes(k))) {
			logger.log(request.header.id, request.questions[0]);
		}
	});

	server.on('listening', () => {
		logger.log('Dns Server runnig at', server.addresses());
	});

	server.on('close', () => {
		logger.log('Dns Server closed');
	});

	server.listen({
		udp: 5333
	});
}

// /system/bin/iptables -t nat -A OUTPUT -p udp ! -d 8.8.8.8 --dport 53 -j DNAT --to-destination 192.168.3.65:5333
// /system/bin/iptables -t nat -D OUTPUT -p udp ! -d 8.8.8.8 --dport 53 -j DNAT --to-destination 192.168.3.65:5333
