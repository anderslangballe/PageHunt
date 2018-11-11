import Packet, {PacketType} from './packet';

export class EntityMovedPacket extends Packet {
    public x = 0.0;
    public y = 0.0;

    constructor(packetDict: any) {
        super();

        this.x = packetDict['x'];
        this.y = packetDict['y'];
    }

    public dictify(): string {
        throw 42;
    }

    public getType(): PacketType {
        return PacketType.EntityMoved;
    }
}
