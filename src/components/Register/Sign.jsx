import SignBack from "./SignBack";
import SignForm from "./SignForm";


export default function Sign(){
    return (
        <div className="bg-[#2f34b5]">
            <div className="flex">
                <section className="w-1/2">
                    <SignForm/>
                </section>

                <section className="w-1/2 my-auto">
                    <SignBack/>
                </section>
            </div>
        </div>
    )
}