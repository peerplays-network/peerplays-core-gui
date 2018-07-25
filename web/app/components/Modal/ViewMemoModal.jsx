import React from 'react';
import Translate from "react-translate-component";
import { connect } from 'react-redux';
import { Modal, ModalBody } from 'react-modal-bootstrap';
import { resetViewModalStatus } from 'actions/MemoActions';
import TimeAgo from "../Utility/TimeAgo";

@connect(state => {
    return {
        isOpen: state.memoModal.isOpen,
        memo: state.memoModal.memo
    }
}, {
    resetViewModalStatus
})
class ViewMemoModal extends React.Component {
    onClose(){
        this.props.resetViewModalStatus();
    }

    render() {    
        return (
            <Modal isOpen={this.props.isOpen} autoFocus={true}>
                <ModalBody>
                    <div className="modal-dialog">
                        <div className="modal-dialogAlignOut">
                            <div className="modal-dialogAlignIn">
                                <div className="modal-dialogContent">
                                    <div className="modalTitle"><Translate content="modal.memo.title" /></div>
                                    <div className="modalContent row">
                                        <div className='col-6 modalSender'>
                                            <p className='modalLabel'><Translate content='dashboard.recent_activity.sender' />:</p>
                                            <p className='modalValue'>{ this.props.memo.sender }</p>
                                        </div>
                                        <div className='col-6 modalReceiver'>
                                            <p className='modalLabel'><Translate content='dashboard.recent_activity.receiver' />:</p>
                                            <p className='modalValue'>{ this.props.memo.receiver }</p>
                                        </div>
                                        <div className="col-12 modalMessage">
                                            <p>{ this.props.memo.message }</p>
                                        </div>
                                        <div className="col-12 modalDate">
                                            <p><TimeAgo time={new Date(this.props.memo.time)}/></p>
                                        </div>
                                    </div>
                                    <div className="modalFooter text_r">
                                        <button type="button" className="btn btn-neutral" onClick={this.onClose.bind(this)}><Translate content="done" /></button>
                                    </div>
                                </div>
                           </div>
                        </div>
                    </div>
                </ModalBody>
            </Modal>
        )
    }
}

export default ViewMemoModal;
