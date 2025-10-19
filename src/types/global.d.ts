declare global {
    namespace JSX {
        interface IntrinsicElements {
            div: any;
            span: any;
            label: any;
            input: any;
            button: any;
            form: any;
            h1: any;
            h2: any;
            h3: any;
            h4: any;
            h5: any;
            h6: any;
            p: any;
            a: any;
            img: any;
            ul: any;
            ol: any;
            li: any;
            table: any;
            thead: any;
            tbody: any;
            tr: any;
            th: any;
            td: any;
            select: any;
            option: any;
            textarea: any;
            svg: any;
            path: any;
            g: any;
            circle: any;
            rect: any;
            [elemName: string]: any;
        }
    }
}

export {};