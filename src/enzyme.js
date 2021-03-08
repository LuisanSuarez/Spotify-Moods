import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
import Enzyme, { configure, mount, render, shallow } from "enzyme";
import "regenerator-runtime/runtime";

configure({ adapter: new Adapter() });
export { shallow, mount, render };
export default Enzyme;
