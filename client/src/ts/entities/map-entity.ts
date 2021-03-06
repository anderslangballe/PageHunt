import Vector2D from "../vector2d";
import {Game} from "../game";

export enum EntityType {
    LocalPlayer = "LPlayer",
    NetworkPlayer = "NPlayer",
    Slender = "Slender",
    Page = "Page",
    Light = "Light",
    Tree = "Tree"
}

export default class MapEntity {
    private picture: HTMLImageElement = null;
    readonly game;
    readonly id: number;
    readonly name: string;
    readonly type: EntityType;
    readonly width: number = 32;
    readonly height: number = 32;
    public pos: Vector2D = new Vector2D(0, 0);

    constructor(game: Game, id: number, type: EntityType, name?: string, pos?: Vector2D) {
        this.game = game;
        this.id = id;
        this.type = type;
        if (type == EntityType.LocalPlayer || type == EntityType.NetworkPlayer) {
            if (name) {
                this.name = name;
            }
            else{
                this.name = "Unknown Player";
            }
        }
        else if (type == EntityType.Slender) {
            this.name = "Slenderman";
        }
        else {
            if (name) {
                this.name = name;
            }
            else {
                this.name = type;
            }
        }

        let image = new Image();
        image.addEventListener('load', () => {
            this.picture = image;
        });
        image.src = "/client/graphics/" + type + ".png";
        
        if (pos) {
            this.pos = pos;
        }

        console.log(`Spawned entity '${this.name}:${this.id}'(${this.type}) at position 'x:${this.pos.x}, y:${this.pos.y}'`);
    }

    public occupiesPosition(position: Vector2D): boolean {
        const a = Math.min(this.pos.x + this.width, position.x + this.width) - Math.max(this.pos.x, position.x);
        const b = Math.min(this.pos.y + this.height, position.y + this.height) - Math.max(this.pos.y, position.y);
        return (a >= 0) && (b >= 0);

    }
}