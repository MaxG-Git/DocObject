import { DocObjectBindFunction } from "../../docbind";
import DocGen from "../../docgen";

export const ListGroup = (_, __, children): DocObjectBindFunction => (g : DocGen) => g.ul(children, { class: 'list-group' });
export function ListItem({ active }, { href, key, }, children): DocObjectBindFunction {
    return (g : DocGen) => {
        return g.a(children, {
            class: `list-group-item list-group-item-action ${key == active ? 'active' : ''}`,
            onclick: () => {
                this.values.active = key
            }
        }
        )
    }
} 