import typescript from 'rollup-plugin-typescript2'
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
        typescript({
            typescript: require('typescript'),
            tsconfig: 'tsconfig.umd.json',
            tsconfigDefaults: {
                sourceMap: true
            }
        }),
        filesize(),
        nodeResolve(),
    ],
}