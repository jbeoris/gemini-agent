import axios from "axios"

const SERPER_API_KEY = process.env.SERPER_API_KEY
const ENDPOINT = "https://google.serper.dev/search"

const MAX_RESULT_COUNT = 4 // increasing this will inrease search result accuracy

export interface SerperResults {
    title: string,
    snippet: string,
    link?: string
}

function getResultLimit(query: string) {
    const wordCount = query.split(' ').length

    return Math.max(0, MAX_RESULT_COUNT - Math.floor(wordCount / 10))
}

export async function get(query: string): Promise<string> {
    let serperResults: string[] = []

    const count = getResultLimit(query)

    if (count === 0) return ''

    const response = await axios.get(ENDPOINT, {
        params: {
            q: query,
            num: count
        },
        headers: {
            'X-API-KEY': SERPER_API_KEY, 
            'Content-Type': 'application/json'
        }
    })

    const data = response.data

    if (!data) return ''

    if (data.answerBox?.answer) serperResults.push(`${data.answerBox?.title}:${data.answerBox?.answer}`)
    if (data.answerBox?.snippet) serperResults.push(`${data.answerBox?.title}:${data.answerBox?.snippet}`)
    if (data.answerBox?.snippet_highlighted_words) serperResults.push(`${data.answerBox?.title}:${data.answerBox?.snippet_highlighted_words}`)
    if (data.sportsResults?.game_spotlight) serperResults.push(`${data.sportsResults?.game_spotlight}`)
    if (data.knowledgeGraph?.description) serperResults.push(`${data.knowledgeGraph?.description}`)
    if (data.organic && data.organic.length > 0) {
        for (let organicResult of data.organic) {
            if (organicResult.snippet) serperResults.push(`${organicResult.title}:${organicResult.snippet}`)
        }
    }

    return `[${serperResults.join('. ')}]`
}