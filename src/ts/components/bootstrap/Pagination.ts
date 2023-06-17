import { DocObjectBindFunction } from "../../docbind";
import DocGen from "../../docgen";

export function PageItem (_, { active, page, offsetName }, children) : DocObjectBindFunction {
    return (g: DocGen) => g.li(
        g.a(children, { class: 'page-link' }),
        { 
            class: 'page-item' + (active ? ' active' : ''), 
            style: { cursor: 'pointer' },
            onclick: () => {
                this.values[offsetName] = page.offset
            }, 
        }
    )
}



export function Pagination (values , { max, total, maxPages, zerothIndex, showPad, offsetName='offset' }) {
    const offset = values[offsetName]
    
    return (g : DocGen) => {
        let totalPages = Math.floor(+total / +max + (+total % +max > 0 ? 1 : 0));
        
                let currentPage = Math.floor(((+offset || 1) - (zerothIndex ? 1 : 0)) / +max) + 1;
                let lowerBound = Math.max(0, currentPage - Math.ceil(+maxPages / 2))
                let upperBound = Math.min(totalPages, currentPage + Math.floor(+maxPages / 2));
                upperBound += (lowerBound == 0) ? (+maxPages % upperBound) : 0
                lowerBound -= (upperBound == totalPages) ? +maxPages - (totalPages % lowerBound) : 0
                
                let pages : {
                    display : string|number,
                    page : number, 
                    offset : number
                }[] = [...Array(totalPages).keys()].slice(lowerBound, upperBound).map(e => {
                    return { display: e + 1, page: e + 1, offset: +max * (e) }
                })
                if (showPad !== undefined && lowerBound > 0) {
                    pages = [
                        { display : 1, page: 1, offset: 0 },
                        { display: '...', page: lowerBound, offset: (lowerBound - 1) * +max },
                        ...pages
                    ]
                }
                if (showPad !== undefined && upperBound < totalPages) {
                    pages = [
                        ...pages,
                        { display: '...', page: upperBound + 1, offset: (upperBound) * +max },
                        { display: totalPages, page: totalPages, offset: (totalPages - 1) * +max },
                    ]
                }
                return g.nav(
                            g.ul(
                                pages.map(page =>
                                    g.PageItem(page.display, { active: currentPage === page.page, page, offsetName })
                        ), { class: 'pagination' }
                    )
                )
    }
}