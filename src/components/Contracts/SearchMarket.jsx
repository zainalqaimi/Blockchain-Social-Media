import { Select } from 'antd';

export default function SearchMarket(props) {
    const { Option } = Select;

    function onChange(value) {
        props.setSearchValue(value);
    }

    return(
        <Select
            showSearch
            style={{ width: 200 }}
            placeholder="Search by user name"
            onChange={onChange}
            optionFilterProp="children"
            filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
        >
            <Option value="all">All items</Option>
            {props.items.map((nft, idx) => (
                <Option value={nft.seller} key={idx}>{nft.name}</Option>
            ))}
        </Select>
    );
}