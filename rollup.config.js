import typescript from '@rollup/plugin-typescript';
import filesize from 'rollup-plugin-filesize'
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
    input: 'src/index.ts',
    output: [
        {
            file: 'release/umd/fsm-sdk.bundle.js',
            format: 'umd',
            name: 'fsm',
            sourcemap: true
        }
    ],
    plugins: [
        typescript({ tsconfig: './tsconfig.umd.json' }),
        filesize(),
        nodeResolve(),
    ],
}