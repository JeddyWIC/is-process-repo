import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { meetings } from "@/lib/schema";

export async function POST() {
  try {
    const content = `
<p>Refer to: <a href="https://industrialsystems.live">industrialsystems.live</a> for SOPs, hints, issues, resolutions.</p>

<blockquote><p><strong>&gt;&gt; SOP of the week:</strong> Airtable Update</p></blockquote>

<p><em>For the individual who creates the most SOP's by 4/15, I have an award.</em></p>

<h2>Safety</h2>

<h3>Incidents / Near Misses:</h3>
<ul>
<li>Driver ran over tailgate of trailer, minor truck damage</li>
<li>(non WIC) as a reminder for airport group — talk to field crews about driving movement areas (or on AOA)</li>
<li>JE to share link to video at LGA</li>
</ul>

<ul data-type="taskList">
<li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span>Open Safety Items</span></label></li>
<li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span>Required Follow-Ups</span></label></li>
</ul>

<p><strong>Status:</strong> <span class="status-green">Green</span></p>

<h2>Active Opportunities</h2>

<table>
<tr><th>Item/Opportunity</th><th>Owner</th><th>Directive/Action</th><th>Due Date</th></tr>
<tr><td>Ardagh L1 Washer</td><td>Wells</td><td>Open – new washer drawings. Scope changes – new date end March</td><td>End March</td></tr>
<tr><td>Ball Rome next 2 phases</td><td>Wells</td><td>Budget PM proposal went out with new structure. Construction proposal ~end march. Actual proposal updated due 4/8</td><td>4/8</td></tr>
<tr><td>Billings MT</td><td>JMU/CB</td><td>Wednesday site visit</td><td>4/1</td></tr>
<tr><td>Coors filling line eq</td><td>RW/JA</td><td>Job walk Wednesday. Add'l walk for warmer 4/8</td><td>4/7 / Warmer 4/28</td></tr>
<tr><td>HPN – White Plains</td><td>PW/JM/LN</td><td>Mandatory pre-bid 3/20 (JM attended)</td><td>4/6</td></tr>
<tr><td>DEN – plane hangers Conc C</td><td>Handed to CD</td><td><strong>NO BID</strong></td><td>4/1</td></tr>
<tr><td>DEN – Art Installation</td><td>JE</td><td></td><td>TBD</td></tr>
<tr><td>DEN – EDS Machine Install</td><td>JE</td><td></td><td>4/8</td></tr>
<tr><td>EWR – TBD if we can walk</td><td>PW/JE</td><td>PW to walk next week if possible</td><td>4/14</td></tr>
<tr><td>LAX – Guardrail + Misc</td><td>CB/JM</td><td>CB to send after review</td><td>4/6</td></tr>
<tr><td>Ohio Art</td><td>JA</td><td>JA to bid, submit</td><td>4/10</td></tr>
<tr><td>JFK Delta T4</td><td>PW</td><td>PW to walk and update</td><td>4/17</td></tr>
<tr><td>SBN Update</td><td>JE</td><td></td><td>4/2</td></tr>
</table>

<ul data-type="taskList">
<li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span>Update the opportunity tracker with recent requests</span></label></li>
</ul>

<p><strong>Possible Award / Pending Award:</strong></p>
<ul data-type="taskList">
<li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span>LN look into visit to Miron &amp; Findorff HQ for introductions – targeting June</span></label></li>
</ul>

<h2>Engineering Updates / Needs</h2>

<h3>Current Constraints</h3>

<table>
<tr><th>Project</th><th>Owner</th><th>Directive/Action</th><th>Due Date</th></tr>
<tr><td>25070500 - MKE</td><td>Carlson</td><td>RFI – (their) design doesn't meet (their) spec. RFI in their court (drive size). RFI r1 reqd with drive size. RFI for Sumitomo substitution and center drive. <strong>HOT</strong>. Updated drive configurations approved. Add ladders/access doors (CO). RFI Approved, EC to send CO 4/3. New response update early next week, letter from Mx team stated Sumitomo were not great...</td><td>HOT</td></tr>
<tr><td>26022200</td><td>Bassette</td><td>HEF 2 standalone EDS conveyor direction provided. May need updated conveyor path. Need new customer forms returned.</td><td>3/26</td></tr>
<tr><td>26033701</td><td>Wells</td><td>RW to update Airtable with Area for release (#SOP)</td><td>4/2</td></tr>
</table>

<h3>Drawing Logs/Drawing Revisions This Week</h3>
<ul data-type="taskList">
<li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span>PSC IFC's received &amp; need to be added to folder</span></label></li>
</ul>

<p><strong>Current Engineering Status:</strong> <span class="status-yellow">Needs work</span></p>

<p><strong>Shop Status:</strong> Current lead time: 6wks</p>

<p><em>Engineers &amp; Optional Attendees Adjourn: 10:26a</em></p>

<hr>

<h2>Project Status Check</h2>

<table>
<tr><th>Project</th><th>Owner</th><th>Directive/Action</th><th>Due Date</th></tr>
<tr><td>25070500</td><td>EC</td><td>Substitution Requests denied. Re-opened. Ongoing, letter sent 3/25</td><td></td></tr>
<tr><td>25060900</td><td>EC</td><td>Mechanica app'd and ordered. 5/25 ship (late)</td><td></td></tr>
<tr><td>25060900</td><td>EC</td><td>Port Logistics for carousel shipping a concern. Update by 4/2</td><td>4/2</td></tr>
</table>

<h3>WIP</h3>

<table>
<tr><th>Item/Project</th><th>Owner</th><th>Required</th><th>Due Date</th></tr>
<tr><td>24070200</td><td>Mueller</td><td>Get PCOs App'd and Invoice</td><td>4/2</td></tr>
</table>

<ul data-type="taskList">
<li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span>Airport Tracker Review</span></label></li>
<li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span>F&amp;B Tracker Review</span></label></li>
</ul>

<h2>Core Rules</h2>
<ul>
<li>No 1:1 tracking unless T&amp;M.</li>
<li>ACO hours must be in the tracker.</li>
<li>PCOs: Avoid if possible; if costs are accruing, include in EAC.</li>
<li>Good data in = good data out. SPI/CPI must make sense logically.</li>
</ul>

<h3>Required Checks</h3>
<ul>
<li>If SPI is good, total hours at complete cannot exceed budget.</li>
<li>% Complete aligns with projection</li>
<li>Actual Hours ÷ % Complete ≈ EAC (sanity check).</li>
<li>Early data should not overly skew EAC on large scopes.</li>
<li>Productivity can vary by phase, area, or task.</li>
<li>Budget, projection, and tracker must reconcile.</li>
<li>Subcontract labor must be accounted for.</li>
<li>Schedule % complete must match MECH Chart Data.</li>
<li>Hours/Ft must include all tasks.</li>
<li>CPI ≠ SPI (ignore for now; fix later).</li>
</ul>

<h3>Alignment</h3>
<ul>
<li>PM and Super must agree on inputs.</li>
<li>Timecard structure should be as simple as possible.</li>
<li>Milestone schedule is updated on Exec cover sheet</li>
</ul>

<h2>Hot Items</h2>

<table>
<tr><th>Item</th><th>Owner</th><th>Required Update</th><th>Due Date</th></tr>
<tr><td>1</td><td>Eddy</td><td>ACC Training Available? How to distribute to Subs?</td><td>4/2/26</td></tr>
</table>
`.trim();

    const now = new Date().toISOString();

    const [meeting] = await db
      .insert(meetings)
      .values({
        date: "2026-04-09",
        time: "9:30 AM",
        location: "Keystone + Teams",
        facilitator: "Eddy",
        attendees: JSON.stringify([
          "Ahlgrim",
          "Benett (Optional)",
          "Carlson",
          "Dumbauld",
          "Holiday",
          "Kittles (Optional)",
          "Kopel",
          "Montgomery",
          "Mueller",
          "Nau",
          "Reynolds",
          "Sar",
          "Sargent (Optional)",
          "Wells",
          "Williams",
        ]),
        content,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return NextResponse.json({ success: true, id: meeting.id });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
