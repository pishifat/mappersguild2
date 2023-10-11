export interface Merch extends Document {
    _id: any;
    id: string;
    title: string;
    description: string;
    images: MerchImage[];
}

export interface MerchImage extends Document {
    src: string;
}