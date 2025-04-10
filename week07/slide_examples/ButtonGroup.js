
function SimpleButton (props) {
	return (
		<Button variant={props.selected?'primary':'secondary'}
		   onClick={() => props.choose(props.index)} >{props.name}</Button>
	)
}

function ButtonGroup (props) {
	const [selected, setSelected] = useState(3);

	const chooseButton = (index) => setSelected(index);
	return (
		<Form>
		{
			props.names.map((e,idx) => <SimpleButton
			  name={e} index={idx} key={idx}
			  selected={idx===selected} choose={chooseButton}></SimpleButton>)
		}
		</Form>
	)
}


{/* <ButtonGroup names={['Chess', 'Poker', 'Black Jack', 'Go']} /> */}
