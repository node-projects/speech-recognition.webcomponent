import { BaseCustomWebComponentConstructorAppend } from "@node-projects/base-custom-webcomponent";

//@ts-ignore
let SpeechRecognition = window.SpeechRecognition || webkitSpeechRecognition;
//@ts-ignore
let SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
//@ts-ignore
let SpeechRecognitionEvent = window.SpeechRecognitionEvent || webkitSpeechRecognitionEvent;

export class SpeechRecognitionWebcomponent extends BaseCustomWebComponentConstructorAppend {

    public static readonly is: string = 'node-projects-speech-recognition';

    //@ts-ignore
    private _recognition: SpeechRecognition;
    private _lastStartedAt: number;

    public static properties = {
        autostart: Boolean,
        text: String,
        confidence: Number,
        grammar: Array
    }

    public autostart: boolean;
    public text: string;
    public confidence: number;
    public grammar: string[];

    override lang = "en-US";

    constructor() {
        super();
        this._restoreCachedInititalValues();
    }

    ready() {
        this._parseAttributesToProperties();

        if (this.autostart) {
            this.start();
        }
    }

    start() {
        this.init();
        this._lastStartedAt = new Date().getTime();
        this._recognition.start();
    }

    init() {
        //@ts-ignore
        let recognition = new SpeechRecognition();
        if (this.grammar) {
            let speechRecognitionList = new SpeechGrammarList();
            let grammar = '#JSGF V1.0; grammar words; public <words> = ' + this.grammar.join(' | ') + ' ;'
            speechRecognitionList.addFromString(grammar, 1);
            recognition.grammars = speechRecognitionList;
        }
        recognition.continuous = false;
        recognition.lang = this.lang;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = (e) => {
            this.text = e.results[0][0].transcript;
            this.confidence = e.results[0][0].confidence;
            this.dispatchEvent(new CustomEvent('', { detail: { text: this.text, confidence: this.confidence } }));
        }

        recognition.onspeechend = () => {
            recognition.stop();
        }

        recognition.onnomatch = (e) => {
        }

        recognition.onerror = (e) => {
        }

        recognition.onend = () => {
            let timeSinceLastStart = new Date().getTime() - this._lastStartedAt;
            if (timeSinceLastStart > 1000) {
                this._lastStartedAt = new Date().getTime();
                setTimeout(() => {
                    this._recognition.start();
                }, 50);
            } else {
                console.log("too fast restart");
            }
        }

        //@ts-ignore
        this._recognition = recognition;
    }
}

customElements.define(SpeechRecognitionWebcomponent.is, SpeechRecognitionWebcomponent);