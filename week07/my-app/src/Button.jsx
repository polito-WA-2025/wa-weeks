
import { useState } from "react";
import { Button } from "react-bootstrap";
function MyButton(props) {
    let [variant, setVariant] = useState('primary') ;
    if (variant === 'primary')
        return <Button variant={variant} onClick={()=>setVariant('secondary')}>{variant}</Button>
            else
        return <Button variant={variant} onClick={()=>setVariant('primary')}>{variant}</Button>
}
export default MyButton;

