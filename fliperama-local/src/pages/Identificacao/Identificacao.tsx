import { useRef, useState } from 'react'
import './Identificacao.css'

type identificacaoProps = {
    onContinuar: (matricula: string, apelido: string) => Promise<void>
}

function Identificacao( {onContinuar}: identificacaoProps ) {
    const [matricula, setMatricula] = useState('')
    const [apelido, setApelido] = useState('')
    const [salvando, setSalvando] = useState(false)
    const [erro, setErro] = useState('')
    const salvandoRef = useRef(false)

    function Confirmar() {
        const apelidoNormalizado = apelido.trim().toUpperCase() || 'ANON'

        if (!/^[A-Z0-9]{1,9}$/.test(apelidoNormalizado)) {
            setErro('Use até 9 letras ou números no apelido, sem espaços.')
            return
        }

        if (apelidoNormalizado !== 'ANON' && matricula !== '' && !/^\d{12}$/.test(matricula)) {
            setErro('A matrícula deve ter 12 números ou ficar vazia.')
            return
        }

        void salvar(apelidoNormalizado === 'ANON' ? '' : matricula, apelidoNormalizado)
    }

    async function salvar(matriculaPartida: string, apelidoPartida: string) {
        if (salvandoRef.current) return

        salvandoRef.current = true
        setSalvando(true)
        setErro('')

        try {
            await onContinuar(matriculaPartida, apelidoPartida)
        } catch {
            setErro('Não foi possível salvar a partida. Verifique o servidor e tente novamente.')
            salvandoRef.current = false
            setSalvando(false)
        }
    }
        
    return (
        <main className="identificacao-screen">
            <h1>REGISTRAR PARTIDA</h1>

            <form className="identificacao-form" onSubmit={(event) => {
                event.preventDefault()
                Confirmar()
            }}>
            <label>
                Matrícula
                <input
                type="text"
                value={matricula}
                maxLength={12}
                inputMode="numeric"
                onChange={(event) => setMatricula(event.target.value.replace(/\D/g, ''))}
                />
            </label>

            <label>
                Apelido
                <input
                type="text"
                value={apelido}
                maxLength={9}
                onChange={(event) => setApelido(event.target.value)}
                />
            </label>

            <p>Seu apelido pode aparecer no ranking. Sem identificação, seu placar e voto ainda são salvos.</p>

            {erro && <p className="identificacao-erro" role="alert">{erro}</p>}

            <button type="submit" disabled={salvando}>
                {salvando ? 'SALVANDO...' : 'SALVAR PARTIDA'}
            </button>
            </form>
            <button
                type="button"
                className="identificacao-anonimo"
                disabled={salvando}
                onClick={() => void salvar('', 'ANON')}
            >
                JOGAR SEM IDENTIFICAÇÃO
            </button>
        </main>
    )
}

export default Identificacao // essa exportação é necessária para que o componente seja utilizado em outros arquivos, como no App.tsx.
