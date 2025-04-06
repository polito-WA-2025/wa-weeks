
function Button(props) {
	if (props.lang === 'it')
		return <button>Ciao!</button>;
	else
		return <button>Hello!</button>;
}
export default Button;
