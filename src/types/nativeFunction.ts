import { NativeParam } from "./nativeParam";

export interface NativeFunction {
	name: string;
	description?: string;
	params: NativeParam[];
	return_type?: string;
}
