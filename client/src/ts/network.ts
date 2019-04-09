import Packet, {PacketType} from './packets/packet';
import EntityMovedPacket from './packets/entity-moved';
import SpawnEntityPacket from './packets/spawn-entity';
import RepositionPacket from './packets/reposition';
import RemoveEntityPacket from "./packets/remove-entity";
import HandshakePacket from "./packets/handshake";
import MovementPacket from "./packets/movement";
import {Game} from "./game";
import Vector2D from "./vector2d";
import WorldTransferPacket from "./packets/world-transfer";
import PickupAbilityPacket from "./packets/pickup-ability";

export default class NetworkClient {
    private socket: WebSocket;
    private game: Game;

    constructor(game: Game, address: string) {
        this.game = game;
        this.socket = new WebSocket(`ws://${address}`);
        this.socket.onopen = () => this.onOpen();
        this.socket.onmessage = (event) => this.onMessage(event);
        this.socket.onclose = () => this.onClose();
        this.socket.onerror = (event) => this.onError(event);
    }

    public sendPlayerMovement(movement: Vector2D): void {
        this.sendPacket(new MovementPacket(movement));
    }

    private sendPacket(packet: Packet): void {
        this.socket.send(JSON.stringify(packet.dictify()));
    }

    private onError(event): void {
        console.error(`Error: ${event}`);
    }

    private constructPacket(data: any): Packet {
        const type: PacketType = data['type'];

        switch (type) {
            case PacketType.EntityMoved:
                return new EntityMovedPacket(data);
            case PacketType.SpawnEntity:
                return new SpawnEntityPacket(data);
            case PacketType.Reposition:
                return new RepositionPacket(data);
            case PacketType.RemoveEntity:
                return new RemoveEntityPacket(data);
            case PacketType.WorldTransfer:
                return new WorldTransferPacket(data);
            case PacketType.PickupAbility:
                return new PickupAbilityPacket(data);
        }

        return null;
    }

    private packetReceived(packet: Packet): void {
        switch (packet.packetType) {
            case PacketType.SpawnEntity:
                return this.game.handleSpawnEntity(<SpawnEntityPacket> packet);
            case PacketType.Reposition:
                return this.game.handleReposition(<RepositionPacket> packet);
            case PacketType.RemoveEntity:
                return this.game.handleRemoveEntity(<RemoveEntityPacket> packet);
            case PacketType.WorldTransfer:
                return this.game.handleWorldReceived(<WorldTransferPacket> packet);
            case PacketType.PickupAbility:
                return this.game.handlePickupAbility(<PickupAbilityPacket> packet);
        }
    }

    private onConnected(): void {
        this.sendPacket(new HandshakePacket('Anders'));
        console.log(`Connected to game server on '${this.socket.url}'`);
    }

    private onMessage(event): void {
        this.packetReceived(this.constructPacket(JSON.parse(event.data)));
    }

    private onOpen(): void {
        this.onConnected();
    }

    private onClose(): void {
        console.log('Connection closed');
    }
}