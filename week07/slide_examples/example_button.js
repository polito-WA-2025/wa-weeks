function Button(props) {
	if (props.lang === 'it')
		return <button>Ciao!</button>;
	else
		return <button>Hello!</button>;
}
function App() {
	return (
		<p>
		Press here: <Button lang='it' />
		</p>
	);
}
