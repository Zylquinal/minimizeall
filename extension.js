/*
  Copyright (c) 2013-2021, Charles Santos Silva (oi@charles.dev.br)

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
  DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
  SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

const St = imports.gi.St;
const Main = imports.ui.main;
const Gio = imports.gi.Gio;
const Me = imports.misc.extensionUtils.getCurrentExtension();

let text, button;

function _hide() {
    Main.uiGroup.remove_actor(text);
    text = null;
}

function canMinimize(window, c_minimized) {
	if (c_minimized && window.minimized)
		return false;

	if (window.is_skip_taskbar !== undefined)
		return !window.is_skip_taskbar();

	if (window.can_minimize == undefined)
		return true;

	return window.can_minimize();

}

function _click(){
        let windows = global.workspace_manager.get_active_workspace().list_windows();

	if (windows.length == 0) {
 		Main.overview.hide();
		return;
	}

	// Check if has any window not minimized
	let minimize = global.workspace_manager.get_active_workspace().list_windows().filter(function(w){return canMinimize(w, true);}).length > 0 || Main.overview._shown;

	global.display.sort_windows_by_stacking(windows).filter(function(w){return canMinimize(w, false);}).forEach(function(window){
		if (minimize)
			window.minimize();
		else
			window.unminimize();
	});

	if (minimize)
		Main.overview.hide();
}


function init(extensionMeta) {

}

function enable() {
	button = new St.Bin({ style_class: 'panel-button', reactive: true, can_focus: true, track_hover: true });
	let gicon = Gio.icon_new_for_string(Me.path + '/icons/minimize-symbolic.svg');
	let icon = new St.Icon({ gicon: gicon, style_class: 'system-status-icon'});
	button.set_child(icon);
	button.connect('button-press-event', _click);

	Main.panel._rightBox.insert_child_at_index(button, 0);
}

function disable() {
	Main.panel._rightBox.remove_child(button);
	button.destroy();
	button = null;
}
