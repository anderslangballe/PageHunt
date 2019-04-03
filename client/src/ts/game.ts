import Player from "./entities/player";
import Input from "./input";
import World from "./world";
import Vector2D from "./vector2d";
import Transform from "./transform";
import Entity, {EntityType} from "./entities/entity";
import NetworkClient from './network';
import SpawnEntityPacket from "./packets/spawn-entity";
import RepositionPacket from "./packets/reposition";
import RemoveEntityPacket from "./packets/remove-entity";
import Camera from "./camera";
import Renderer from "./renderer";
import WorldTransferPacket from "./packets/world-transfer";

export class Game {
    tickrate: number = 40;
    player: Player;
    world: World;
    lastTickTime: number = Date.now();
    tickInterval: number;
    enableInput: boolean = false;
    networkClient: NetworkClient;
    camera: Camera;
    renderer: Renderer;
    lastPlayerPos: Vector2D;
    
    constructor(canvasId: string) {
        this.networkClient = new NetworkClient(this, 'localhost:4000');
        this.renderer = new Renderer(this, canvasId);
        this.camera = new Camera(new Vector2D(0, 0), this.renderer.canvas);

        document.addEventListener('keydown', (event) => {
            Input.addKey(event.key);
        });
        document.addEventListener('keyup', (event) => {
            Input.removeKey(event.key);
        });
        window.addEventListener('resize', () => {
            this.renderer.onResize(window.innerWidth, window.innerHeight);
            this.camera.onResize(this.renderer.canvas);
            if (this.player)
                this.camera.setPosition(this.player.transform.position);
        });

        //Start the game loop
        this.tickInterval = setInterval(() => this.tick(), 1000/this.tickrate);
        this.enableInput = true;
    }

    private buildPlayer(id: number, moveSpeed: number, name: string, transform?: Transform): Player {
        const ply = new Player(id, null, this.world, moveSpeed, name, transform != null ? transform: null);
        this.lastPlayerPos = ply.transform.position;
        return ply;
    }

    private tick(): void {
        let tickTime = Date.now();
        let dt = ((Date.now() - this.lastTickTime) / 1000) * 20;
        this.lastTickTime = tickTime;

        if (!this.world)
            return;
        if (!this.player)
            return;
        if (!this.camera)
            return;

        this.world.getAllEntities().forEach(function (entity: Entity) {
            entity.tick(dt);
        });

        this.camera.setPosition(this.player.transform.position);
        // Only send movement updates if we have actually moved
        if (this.player.transform.position.distance(this.lastPlayerPos) > 0.5) {
            console.log("Sending movement packet");
            this.networkClient.sendPlayerMovement(this.player.transform.position);
        }
        this.lastPlayerPos = this.player.transform.position;
        this.camera.tick(dt);
    }

    public handleSpawnEntity(packet: SpawnEntityPacket): void {
        if (packet.entity == EntityType.LocalPlayer) {
            const transform = new Transform(packet.x, packet.y, 32, 32);
            this.player = this.buildPlayer(packet.id, packet.speed, packet.name, transform);
            this.camera.setPosition(transform.position);
            this.world.addEntity(this.player);
        }
        else {
            this.world.addEntity(this.world.constructEntity(packet));
        }
    }

    public handleWorldReceived(packet: WorldTransferPacket): void {
        this.world = packet.world;
    }

    public handleReposition(packet: RepositionPacket): void {
        this.world.getAllEntities().forEach(function (ent: Entity) {
            if (ent.id === packet.id) {
                ent.transform.position = new Vector2D(packet.x, packet.y);
            }
        });
    }

    public handleRemoveEntity(packet: RemoveEntityPacket) {
        console.log(`Player ${packet.id} disconnected!`);
        this.world.removeEntity(packet.id);
    }
}

