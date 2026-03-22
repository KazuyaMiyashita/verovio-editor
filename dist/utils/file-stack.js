/**
 * The FileStack class for storing previously loading files in a storage provider.
 */
//@ts-ignore
const pako = window.pako;
export class FileStack {
    stack;
    storage;
    constructor(storage) {
        this.storage = storage;
        const cache = this.storage.getItem("fileStack");
        //console.debug( cache );
        this.stack = Object.assign({
            idx: 0,
            items: 0,
            maxItems: 6,
            filenames: [],
        }, JSON.parse(cache || "{}"));
        //console.debug( this.stack );
    }
    store(filename, data) {
        let list = this.fileList();
        for (let i = 0; i < list.length; i++) {
            // Same filename, check the content
            if (filename === list[i].filename) {
                let file = this.load(list[i].idx);
                if (data === file.data) {
                    console.debug("File already in the list");
                    return;
                }
            }
        }
        this.stack.idx--;
        if (this.stack.idx < 0)
            this.stack.idx = this.stack.maxItems - 1;
        this.stack.filenames[this.stack.idx] = filename;
        //let compressedData = zlib.deflateSync( data ).toString( 'base64' );
        let compressedData = btoa(pako.deflate(data, { to: "string" }));
        this.storage.setItem("file-" + this.stack.idx, compressedData);
        // Increase the stack items if not full
        if (this.stack.items < this.stack.maxItems - 1)
            this.stack.items++;
        this.storage.setItem("fileStack", JSON.stringify(this.stack));
    }
    load(idx) {
        let data = this.storage.getItem("file-" + idx);
        //let decompressedData = zlib.inflateSync( new Buffer( data, 'base64' ) ).toString();
        let decompressedData = pako.inflate(atob(data), { to: "string" });
        return { filename: this.stack.filenames[idx], data: decompressedData };
    }
    getLast() {
        if (pako !== undefined && this.stack.items > 0) {
            return this.load(this.stack.idx);
        }
    }
    fileList() {
        let list = new Array();
        for (let i = 0; i < this.stack.items; i++) {
            let idx = (this.stack.idx + i) % this.stack.maxItems;
            list.push({ idx: idx, filename: this.stack.filenames[idx] });
            //console.log(idx, this.stack.storage[idx]);
        }
        return list;
    }
    reset() {
        let list = this.fileList();
        for (let i = 0; i < list.length; i++) {
            this.storage.removeItem("file-" + list[i].idx);
        }
        this.storage.removeItem("fileStack");
        this.stack.items = 0;
    }
}
//# sourceMappingURL=file-stack.js.map